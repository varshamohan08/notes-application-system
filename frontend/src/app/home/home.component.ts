import { AfterViewInit, Component, HostListener, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Output, EventEmitter, SimpleChanges, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { debounceTime } from 'rxjs/operators';
import { MatGridListModule } from '@angular/material/grid-list';
import { LayoutComponent } from '../layout/layout.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { BackendService } from '../backend.service';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EditorComponent } from '../shared/editor/editor.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import swal from 'sweetalert';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    MatGridListModule,
    MatCardModule,
    MatChipsModule,
    MatRippleModule,
    QuillModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    EditorComponent,
    MatMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  // @ViewChild('toolbar-container') toolbarContainer: ElementRef;
  @Input() notes_lst: any[] = [];
  @ViewChild('labels') labelsMenuTrigger!: MatMenuTrigger;
  editorContent = '';
  quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image', 'formula'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };
  textContent:any = null;
  labelTitle:any = null;
  editIndex:any = null
  label_lst:any = []

  pins_lst:any[] = []
  archives_lst:any[] = []
  bg_images:any;
  bg_colors:any;
  pageMode = 'light'
  selectedImage:any = null;
  userDetails:any;
  bln_list_view:boolean=false
  bg_data:any;
  collaborator_lst: string[] = [];
  emailError: string | null = null;
  collaborator_email: string = '';


  constructor(
    private backendService: BackendService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    if (localStorage.getItem('page_mode') == 'dark') {
      this.pageMode = 'dark'
    }
    else {
      this.pageMode = 'light'
    }
  }

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    if (typeof document !== 'undefined') {
      this.reorderItems();

      const container = document.getElementById('others-container');
      if (container) {
        this.resizeObserver = new ResizeObserver(() => {
          this.reorderItems();
        });

        this.resizeObserver.observe(container);
      }
    }

  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  ngOnInit(): void {
    this.getData()
    this.getLabels()
    this.http.get('assets/jsons/background.json').subscribe((data:any) => {
      this.bg_images = data['images'];
      this.bg_colors = data[this.pageMode]
      this.bg_data = data
      console.log(this.bg_images);
    });
    this.userDetails=JSON.parse(localStorage.getItem('user_details') || '{"email":"","first_name":"","last_name":""}')

  }
  refreshLabels() {
    // this.getData()
    this.getLabels()
  }

  getLabels() {
    this.backendService.getData('notes/labels').subscribe((res)=> {
      if(res.success) {
        console.log('success');
        this.label_lst = res.details
      }
      else {
        console.log(res.details);
      }
    },(error)=>{
      console.log('error')
    })
  }

  getData(label: any = null) {
    if (localStorage.getItem('list_view') == "true"){
      this.bln_list_view = true
    }
    else {
      this.bln_list_view = false
    }

    console.log(label);
    
    let strParam = ''
    const labelName = label || localStorage.getItem('page')

    if (labelName) {
      strParam += '?label='+labelName
    }
    this.backendService.getData('notes/'+strParam).subscribe((res)=> {
      if(res.success) {
        console.log('success', res);
        console.log('colr', res.pins[0].bg_color)
        this.notes_lst = res.details
        this.pins_lst = res.pins
        this.archives_lst = []
        this.cdr.detectChanges();
        // setTimeout(() => {
          this.reorderItems()
        // }, 50);
      }
      else {
        console.log(res.details);
      }
      
    },(error)=>{
      console.log('error')
    })
  }

  private reorderItems(): void {
    // Get all containers with the 'notes-container' class
    const containers = Array.from(document.getElementsByClassName('notes-container')) as HTMLElement[];
    
    // Loop through each container
    containers.forEach((container: HTMLElement) => {
      const items = Array.from(container.getElementsByClassName('item')) as HTMLElement[];
      const containerWidth = container.clientWidth;
      const columns = this.getColumnCount(containerWidth);
      const gutter = 20; // Adjust the gutter size as needed
  
      // Calculate the width of each item in percentage
      const totalGutterWidth = (columns + 1) * gutter;
      const itemWidthPercentage = ((containerWidth - totalGutterWidth) / containerWidth) * (100 / columns); // Item width as percentage
  
      // Initialize an array to keep track of the height of each column
      const columnHeights = Array(columns).fill(0);
  
      items.forEach((item, index) => {
        const column = index % columns;
        const leftOffset = column * (itemWidthPercentage + (gutter / containerWidth) * 100); 
  
        // Set the order and position the item
        item.style.order = String(column);
        item.style.position = 'absolute';
        item.style.top = `${columnHeights[column]}px`;
        item.style.left = `${leftOffset}%`; 
        item.style.width = `${itemWidthPercentage}%`; 
  
        const content = item.querySelector('.item-content') as HTMLElement;
        const readMoreButton = item.querySelector('.btn-read-more') as HTMLElement;
  
        if (content && readMoreButton) {
          if (content.clientHeight > 220) {
            readMoreButton.style.display = 'block';
            content.style.maxHeight = '220px';
          }
        }
  
        // Update the height of the column including item height and gutter
        columnHeights[column] += item.clientHeight + gutter;
      });
  
      // Set the container height to the height of the tallest column
      container.style.height = `${Math.max(...columnHeights)}px`;
    });
  }
  

  private getColumnCount(containerWidth: number): number {
    if (this.bln_list_view) {
      return 1
    }else {
      if (containerWidth >= 1600) {
        return 6;
      } else if (containerWidth >= 1240) {
        return 5;
      } else if (containerWidth >= 900) {
        return 4;
      } else if (containerWidth >= 700) {
        return 3;
      } else if (containerWidth >= 500) {
        return 2;
      } else {
        return 1;
      }
    }
  }
  

  open(content:any,index: any, type:string = 'notes') {
    if (type == 'pin') {
      this.editIndex = index
      this.textContent = this.pins_lst[index]['description']
      this.labelTitle = this.pins_lst[index]['title']
      this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static'});
    }
    if (type == 'archive') {
      this.editIndex = index
      this.textContent = this.archives_lst[index]['description']
      this.labelTitle = this.archives_lst[index]['title']
      this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static'});
    }
    else {
      this.editIndex = index
      this.textContent = this.notes_lst[index]['description']
      this.labelTitle = this.notes_lst[index]['title']
      this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static'});
    }
    // this.activeOption = option;
  }

  editModalDismiss(type:string = 'notes') {
    if(type=='pin') {
      if (this.textContent !== this.pins_lst[this.editIndex]['description'] || this.labelTitle !== this.pins_lst[this.editIndex]['title']) {
        let dctData = this.pins_lst[this.editIndex]
        dctData['description'] = this.textContent
        dctData['title'] = this.labelTitle
        this.backendService.putData('notes/', dctData).subscribe((res)=> {
          if(res.success) {
            console.log('success');
            this.pins_lst[this.editIndex]['description'] = this.textContent
            this.pins_lst[this.editIndex]['title'] = this.labelTitle
            this.modalService.dismissAll()
          }
          else {
            this.toastr.error(res.details)
          }
        },(error)=>{
          this.toastr.error(error)
          console.log('error')
        })
      }
      else {
        this.pins_lst[this.editIndex]['description'] = this.textContent
        this.pins_lst[this.editIndex]['title'] = this.labelTitle
        this.modalService.dismissAll()
      }
    }
    if(type=='archive') {
      if (this.textContent !== this.archives_lst[this.editIndex]['description'] || this.labelTitle !== this.archives_lst[this.editIndex]['title']) {
        let dctData = this.archives_lst[this.editIndex]
        dctData['description'] = this.textContent
        dctData['title'] = this.labelTitle
        this.backendService.putData('notes/', dctData).subscribe((res)=> {
          if(res.success) {
            console.log('success');
            this.archives_lst[this.editIndex]['description'] = this.textContent
            this.archives_lst[this.editIndex]['title'] = this.labelTitle
            this.modalService.dismissAll()
          }
          else {
            this.toastr.error(res.details)
          }
        },(error)=>{
          this.toastr.error(error)
          console.log('error')
        })
      }
      else {
        this.archives_lst[this.editIndex]['description'] = this.textContent
        this.archives_lst[this.editIndex]['title'] = this.labelTitle
        this.modalService.dismissAll()
      }
    }
    else {
      if (this.textContent !== this.notes_lst[this.editIndex]['description'] || this.labelTitle !== this.notes_lst[this.editIndex]['title']) {
        let dctData = this.notes_lst[this.editIndex]
        dctData['description'] = this.textContent
        dctData['title'] = this.labelTitle
        this.backendService.putData('notes/', dctData).subscribe((res)=> {
          if(res.success) {
            console.log('success');
            this.notes_lst[this.editIndex]['description'] = this.textContent
            this.notes_lst[this.editIndex]['title'] = this.labelTitle
            this.modalService.dismissAll()
          }
          else {
            this.toastr.error(res.details)
          }
        },(error)=>{
          this.toastr.error(error)
          console.log('error')
        })
      }
      else {
        this.notes_lst[this.editIndex]['description'] = this.textContent
        this.notes_lst[this.editIndex]['title'] = this.labelTitle
        this.modalService.dismissAll()
      }
    }
  }

  onNoteAdded(newNote: any) {
    this.notes_lst.unshift(newNote);
    this.cdr.detectChanges();
    this.reorderItems()
  }

  openLabelsMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.labelsMenuTrigger.openMenu();
  }

  onLabelSelectionChange(index:any, label: any, event?: MatCheckboxChange, type:string = 'note'): void {
    let dctData = { ...this.notes_lst[index] };
    let labelIds = []
    if (type=='pin') {
      dctData = {...this.pins_lst[index]}
      labelIds = Object.keys(dctData['labels']).map(id => parseInt(id, 10));
    }
    else if (type=='archive') {
      dctData = {...this.archives_lst[index]}
      labelIds = Object.keys(dctData['labels']).map(id => parseInt(id, 10));
    }
    else {
      dctData = {...this.notes_lst[index]}
      labelIds = Object.keys(dctData['labels']).map(id => parseInt(id, 10));
    }
    

    const isChecked = event ? event.checked : false;
    console.log(isChecked);
    
    if (isChecked) {
      if (!labelIds.includes(label.id)) {
        labelIds.push(label.id);
      }
    } else {
      console.log(label, 'la');
      
      labelIds = labelIds.filter(id => (id !== label.id) && id != label.key);
    }
    dctData['labels'] = labelIds
    this.backendService.putData('notes/', dctData).subscribe((res)=> {
      if(res.success) {
        console.log('success');
        if (type=='pin') {
          this.pins_lst[index]['labels'] = res.details.labels
        }
        else if (type=='archive') {
          this.archives_lst[index]['labels'] = res.details.labels
        }
        else {
          this.notes_lst[index]['labels'] = res.details.labels
        }
        this.cdr.detectChanges();
        this.reorderItems()
        // this.modalService.dismissAll()
      }
      else {
        this.toastr.error(res.details)
      }
    },(error)=>{
      this.toastr.error(error)
      console.log('error')
    })
  }

  PinsUpdateFn(status: string, index: number): void {
    let dctData = { ...this.pins_lst[index] };
  
    // Update pin or archive status
    if (status === 'pin') {
      dctData['pin_bln'] = !dctData['pin_bln'];
    } else if (status === 'archive') {
      dctData['archive_bln'] = !dctData['archive_bln'];
    }
  
    // Call backend to update data
    this.backendService.putData('notes/', dctData).subscribe(
      (res) => {
        if (res.success) {
          console.log('success');
  
          if (status === 'pin') {
            // Handle pinning/unpinning logic
            const isAlreadyPinned = this.pins_lst.some(note => note.id === dctData.id);
            if (!dctData['pin_bln']) {
              // If unpinned, remove from pins_lst
              this.pins_lst.splice(index, 1);
              // Add back to notes_lst if it's not archived
              if (!dctData['archive_bln']) {
                this.notes_lst.push(dctData);
              }
            }
          } else if (status === 'archive') {
            // If archived, remove from both lists
            this.pins_lst = this.pins_lst.filter(note => note.id !== dctData.id);
            this.notes_lst = this.notes_lst.filter(note => note.id !== dctData.id);
          }
  
          // Trigger view updates
          this.cdr.detectChanges();
          this.reorderItems();
          this.modalService.dismissAll();
        } else {
          this.toastr.error(res.details);
        }
      },
      (error) => {
        this.toastr.error('Error updating note');
        console.log('Error:', error);
      }
    );
  }

  ArchiveUpdateFn(status: string, index: number): void {
    let dctData = { ...this.archives_lst[index] };
  
    // Update archive status
    dctData['archive_bln'] = false;
  
    // Call backend to update data
    this.backendService.putData('notes/', dctData).subscribe(
      (res) => {
        if (res.success) {
          console.log('success');
  
          // Push the note to notes_lst
          this.notes_lst.push(dctData);
  
          // Sort the notes_lst by id
          this.notes_lst.sort((a, b) => a.id - b.id);
  
          // Remove the note from archives_lst
          this.archives_lst.splice(index, 1);
  
          // Trigger view updates
          this.cdr.detectChanges();
          this.reorderItems();
          this.modalService.dismissAll();
        } else {
          this.toastr.error(res.details);
        }
      },
      (error) => {
        this.toastr.error('Error updating note');
        console.log('Error:', error);
      }
    );
  }

  updateFn(status: string, index: number): void {
    let dctData = { ...this.notes_lst[index] };
  
    // Update pin or archive status
    if (status === 'pin') {
      dctData['pin_bln'] = !dctData['pin_bln'];
    } else {
      dctData['archive_bln'] = !dctData['archive_bln'];
    }
  
    // Call backend to update data
    this.backendService.putData('notes/', dctData).subscribe(
      (res) => {
        if (res.success) {
          console.log('success');
  
          if (status === 'pin') {
            // Ensure the note is not already in pins_lst to avoid duplicates
            const isAlreadyPinned = this.pins_lst.some(
              (note) => note.id === dctData.id
            );
            if (!isAlreadyPinned) {
              this.pins_lst.push(dctData);
            }
          }
  
          // Remove from notes_lst after updating
          this.notes_lst.splice(index, 1);
  
          // Trigger view updates
          this.cdr.detectChanges();
          this.reorderItems();
          this.modalService.dismissAll();
        } else {
          this.toastr.error(res.details);
        }
      },
      (error) => {
        this.toastr.error('Error updating note');
        console.log('Error:', error);
      }
    );
  }
  

  removeLabel(label: any) {
    // const index = this.selectedLabels.indexOf(label);
    // if (index > -1) {
    //     this.selectedLabels.splice(index, 1);
    // }
    // this.label_lst.forEach((ele:any)=>{
    //   if (ele.id == label.id) {
    //     ele.selected = false
    //   }
    // })
  }

  onLoadNotesByLabelsFn(label:any) {
    console.log(label, 'll'); 
    this.getData(label)
  }

  onViewChangeFn(viewPage:any) {
    this.bln_list_view = viewPage
    this.cdr.detectChanges();
    this.reorderItems();
    localStorage.setItem('list_view', JSON.stringify(this.bln_list_view))
  }

  onPageModeChangeFn(mode:any) {
    this.pageMode = mode
    this.bg_colors = this.bg_data[mode]
    console.log(this.bg_colors);
    this.cdr.detectChanges();
    this.reorderItems()
    // window.location.reload()
  }

  deleteNote(id: any, index: any, type:string = 'note', status:string = 'delete') {
    swal({
      title: "Are you sure?",
      text: "Once deleted, the note will be moved to the trash folder!",
      icon: "warning",
      buttons: [true, "Delete"],
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        this.backendService.deleteData('notes/?pk=' + JSON.stringify(id)).subscribe((res) => {
          if (res.success) {
            swal("Poof! Note has been deleted!", {
              icon: "success",
              buttons: [true, "OK"],
            }).then(() => {
              // Remove the note from the list
              if (type=='pin'){
                this.pins_lst.splice(index, 1)
              }
              else if (type=='archive'){
                this.archives_lst.splice(index, 1)
              }
              else {
                this.notes_lst.splice(index, 1);
              }
              this.cdr.detectChanges();
              // Refresh items if needed
              this.reorderItems();
              // Close the modal if applicable
              this.modalService.dismissAll();
            });
          } else {
            console.log(res.details);
          }
        }, (error) => {
          console.log('error');
        });
      } else {
        swal("Your imaginary file is safe!");
      }
    });
  }

  async changeBackground(data: any, index: any, type: string, datatype: string) {
    let dctData = { ...this.notes_lst[index] };
  
    if (type === 'pin') {
      dctData = { ...this.pins_lst[index] };
    } else if (type === 'archive') {
      dctData = { ...this.archives_lst[index] };
    }
  
    if (datatype === 'image') {
      dctData['bg_image'] = data;
    } else {
      dctData['bg_color'] = data;
    }
  
    try {
      const res = await this.backendService.putData('notes/', dctData).toPromise();
  
      if (res.success) {
        console.log('success');
        
        if (type === 'pin') {
          if (datatype === 'image') {
            this.pins_lst[index].bg_image = data;
          } else {
            this.pins_lst[index].bg_color = data;
          }
        } else if (type === 'archive') {
          if (datatype === 'image') {
            this.archives_lst[index].bg_image = data;
          } else {
            this.archives_lst[index].bg_color = data;
          }
        } else {
          if (datatype === 'image') {
            this.notes_lst[index].bg_image = data;
          } else {
            this.notes_lst[index].bg_color = data;
          }
        }
  
        this.cdr.detectChanges();
        this.reorderItems();
      } else {
        this.toastr.error(res.details);
      }
    } catch (error) {
      this.toastr.error('Error updating note');
      console.log('Error:', error);
    }
  }
  

  isSelected(data: any = null, index: any, type:string, datatype:string): boolean {
    if(type == 'pin'){
      if(datatype == 'image'){
        return this.pins_lst[index].bg_image == data;
      }
      else {
        console.log(this.pins_lst[index].bg_color, this.bg_colors[this.pins_lst[index].bg_color], data);
        
        return this.bg_colors[this.pins_lst[index].bg_color] == data;
      }
    }
    else if(type == 'archive'){
      if(datatype == 'image'){
        return this.archives_lst[index].bg_image == data;
      }
      else {
        return this.bg_colors[this.archives_lst[index].bg_color] == data;
      }
    }
    else {
      if(datatype == 'image'){
        return this.notes_lst[index].bg_image == data;
      }
      else {
        return this.bg_colors[this.notes_lst[index].bg_color] == data;
      }
    }
  }

  onSearch(query:any) {
    if (query) {
      let strParam = '?q='+query
      const labelName = localStorage.getItem('page')
      if (labelName) {
        strParam += '&label='+labelName
      }
      this.backendService.getData('notes/search'+strParam).subscribe((res)=> {
        if(res.success) {
          console.log('success');
          this.notes_lst = res.notes
          this.pins_lst = res.pins
          this.archives_lst = res.archives
          this.cdr.detectChanges();
          this.reorderItems()
        }
        else {
          this.toastr.error(res.details)
        }
      },(error)=>{
        this.toastr.error(error)
        console.log('error')
      })
    }
  }

  addCollaborator() {
    if (!this.emailError && this.collaborator_email) {
      this.collaborator_lst.push(this.collaborator_email);
      this.collaborator_email = '';
    }
  }

  removeCollaborator(index: number) {
    this.collaborator_lst.splice(index, 1);
  }

  validateEmail() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    // Check if the email is valid
    if (!emailPattern.test(this.collaborator_email)) {
      this.emailError = 'Invalid email address';
    } 
    // Check if the email already exists in the collaborator list
    else if (this.collaborator_lst.includes(this.collaborator_email)) {
      this.emailError = 'Email is already in the collaborator list';
    } 
    // Check if the email is the same as the user's email
    else if (this.collaborator_email === this.userDetails.email) {
      this.emailError = 'You cannot add your own email';
    } 
    // If all checks pass, the email is valid
    else {
      this.emailError = null;
    }
  }
  
}
