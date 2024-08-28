import { AfterViewInit, Component, HostListener, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Output, EventEmitter, SimpleChanges, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { debounceTime } from 'rxjs/operators';
import {MatGridListModule} from '@angular/material/grid-list';
import { LayoutComponent } from '../layout/layout.component';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
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
import swal from 'sweetalert';

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
  textContent:any=null;
  labelTitle:any=null;
  editIndex:any=null
  label_lst:any= []


  constructor(
    private backendService: BackendService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    
  }

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    if (typeof document !== 'undefined') {
      this.reorderItems();

      const container = document.getElementById('dynamic-container');
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
    console.log(label);
    
    let strParam = ''
    const labelName = label || localStorage.getItem('page')
    if (labelName) {
      strParam += '?label='+labelName
    }
    this.backendService.getData('notes/'+strParam).subscribe((res)=> {
      if(res.success) {
        console.log('success');
        this.notes_lst = res.details
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
    // const container = null
    if (typeof document !== 'undefined') {
      const container = document.getElementById('dynamic-container');
    // }
    if (!container) return;
    

    const items = Array.from(container.getElementsByClassName('item')) as HTMLElement[];
    const containerWidth = container.clientWidth;
    const columns = this.getColumnCount(containerWidth);
    const gutter = 20; // Adjust the gutter size as needed

    // Calculate the width of each item in percentage
    const totalGutterWidth = (columns + 1) * gutter;
    const itemWidthPercentage = ((containerWidth - totalGutterWidth) / containerWidth) * (100 / columns); // Item width as percentage

    // Initialize an array to keep track of the height of each column
    const columnHeights = Array(columns).fill(0);
      console.log(columns);
      
    items.forEach((item, index) => {
      // Determine which column this item should go to
      const column = index % columns;

      // Calculate the left position including gutter to center the item in the column
      const leftOffset = column * (itemWidthPercentage + (gutter / containerWidth) * 100); // left offset as percentage

      // Set the order and position the item
      item.style.order = String(column);
      item.style.position = 'absolute';
      item.style.top = `${columnHeights[column]}px`;
      item.style.left = `${leftOffset}%`; // Position the item with gutter included
      item.style.width = `${itemWidthPercentage}%`; // Set item width as percentage
      // console.log(item.clientHeight);

      // Check if the content height is greater than 220px and show the "Read more" button if it is
      const content = item.querySelector('.item-content') as HTMLElement;
      const readMoreButton = item.querySelector('.btn-read-more') as HTMLElement;
      // console.log(readMoreButton, content);
      
      if (content && readMoreButton) {
        // console.log(content.clientHeight, content.clientHeight > 220);
        
        if (content.clientHeight > 220) {
          readMoreButton.style.display = 'block';
          content.style.maxHeight = '220px'
        } 
        // else {
        //   readMoreButton.style.display = 'none';
        // }
      }
      

      // Update the height of the column including item height and gutter
      columnHeights[column] += item.clientHeight + gutter;
    });

    // Set the container height to the height of the tallest column
    container.style.height = `${Math.max(...columnHeights)}px`;
  }
  }

  private getColumnCount(containerWidth: number): number {
    if (containerWidth >= 1800) {
      return 5;
    } else if (containerWidth >= 1300) {
      return 4;
    } else if (containerWidth >= 900) {
      return 3;
    } else if (containerWidth >= 700) {
      return 2;
    } else {
      return 1;
    }
  }

  open(content:any,index: any) {
    this.editIndex = index
    this.textContent = this.notes_lst[index]['description']
    this.labelTitle = this.notes_lst[index]['title']
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static'});
    // this.activeOption = option;
  }

  editModalDismiss() {
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

  onNoteAdded(newNote: any) {
    this.notes_lst.unshift(newNote);
    this.cdr.detectChanges();
    this.reorderItems()
  }

  openLabelsMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.labelsMenuTrigger.openMenu();
  }

  onLabelSelectionChange(index:any, label: any, event?: MatCheckboxChange): void {
    let dctData = { ...this.notes_lst[index] };
    let labelIds = Object.keys(dctData['labels']).map(id => parseInt(id, 10));

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
        this.notes_lst[index]['labels'] = res.details.labels
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

  archiveFn(index:any): void {
    let dctData = { ...this.notes_lst[index] };

    dctData['archive_bln'] = !dctData['archive_bln']
    
    this.backendService.putData('notes/', dctData).subscribe((res)=> {
      if(res.success) {
        console.log('success');
        this.notes_lst.splice(index, 1);
        this.cdr.detectChanges();
        this.reorderItems();
        this.modalService.dismissAll();
      }
      else {
        this.toastr.error(res.details)
      }
    },(error)=>{
      this.toastr.error(error)
      console.log('error')
    })
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
  deleteNote(id: any, index: any) {
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
              this.notes_lst.splice(index, 1);
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
  
}
