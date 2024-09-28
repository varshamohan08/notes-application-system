import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { BackendService } from '../backend.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { EmailValidator, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { QuillModule } from 'ngx-quill';
import { HomeComponent } from '../home/home.component';
import { EditorComponent } from '../shared/editor/editor.component';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    QuillModule,
    EditorComponent,
    MatMenuModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatListModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  hideSideNav = false
  mobileQuery: MediaQueryList;
  activeOption: string = 'Notes';
  label_lst:any = []
  newLabel:any = null
  isHovered:boolean = false
  isAddLabel:boolean = false
  editingLabel = ''
  newLabelDescription:any=null;
  newLabelTitle:any=null;
  bg_image:any=null;
  bg_color:any=null;
  bln_archive:boolean=false
  bln_pin:boolean=false
  selectedLabels:any= []
  bg_images:any;
  bg_colors:any;
  pageMode = 'light'
  userDetails:any;
  emailError: string | null = null;
  collaborator_email: string = '';
  collaborator_lst: string[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];
  bln_list_view:boolean=false
  bln_light_mode:boolean=false

  @ViewChild(HomeComponent) home!: HomeComponent;
  @Output() noteAdded: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('labels') labelsMenuTrigger!: MatMenuTrigger;
  @Output() labelAdded = new EventEmitter<void>();
  @Output() loadNotesByLabels: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadNotesBySearch: EventEmitter<any> = new EventEmitter<any>();
  @Output() viewChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() pageModeChanged: EventEmitter<any> = new EventEmitter<any>();

  textContent:any=null;


  open(content:any, size:string,option: string) {
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static'});
    // this.activeOption = option;
  }

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef, 
    media: MediaMatcher,
    private backendService: BackendService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.getLabels()
    const active = localStorage.getItem('active');
    if (active) {
      this.setActiveOption(active);
    }
  }

  ngAfterViewInit(): void {
    this.pageModeFn()
  }

  ngOnInit(): void {
    this.http.get('assets/jsons/background.json').subscribe((data:any) => {
      this.bg_images = data['images'];
      this.bg_colors = data[this.pageMode]
      console.log(this.bg_images);
    });
    this.userDetails=JSON.parse(localStorage.getItem('user_details') || '{"email":"","first_name":"","last_name":""}')
    const body = document.body;
    if (localStorage.getItem('page_mode') == 'dark') {
      body.classList.remove('dark');  // Remove 'dark' class in light mode
      this.bln_light_mode = false
    } else {
      body.classList.add('dark');  // Add 'dark' class in dark mode
      this.bln_light_mode = true
    }
  }

  logOut() {
    this.backendService.getData('logout').subscribe((res)=> {
      if(res.success) {
        this.authService.removeToken()
      }
      else {
        console.log(res.details);
      }
    },(error)=>{
      console.log('error')
    })
  }

  getLabels() {
    this.backendService.getData('notes/labels').subscribe((res)=> {
      if(res.success) {
        console.log('success');
        this.label_lst = res.details
        console.log(this.label_lst,'l');
        
      }
      else {
        console.log(res.details);
      }
    },(error)=>{
      console.log('error')
    })
  }

  setActiveOption(option: string): void {
    this.activeOption = option;
    localStorage.setItem('active', option);  // Update localStorage whenever active option changes
  }

  addLabels() {
    this.backendService.postData('notes/labels', {'name': this.newLabel}).subscribe((res)=> {
      if(res.success) {
        console.log('success');
        this.label_lst = res.details
        this.newLabel = null
        this.labelAdded.emit();
      }
      else {
        console.log(res.details);
      }
    },(error)=>{
      console.log('error')
    })
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  enableEdit(index:any) {
    
    if (index !== -1) {
      this.label_lst.forEach((item:any, i:any) => {
        item.bln_disabled = true;
      });

      this.label_lst[index].bln_disabled = false;
      this.editingLabel = this.label_lst[index].name
    } else {
      console.error('Label not found in the list');
    }
  }

  editLabel(index:any) {
    if(this.editingLabel != this.label_lst[index].name) {
      this.backendService.putData('notes/labels', {'name': this.label_lst[index].name, 'id':this.label_lst[index].id}).subscribe((res)=> {
        // this.editingLabel = ''
        this.label_lst[index].bln_disabled = true;
        if(res.success) {
          console.log('success');
          
          // this.label_lst = res.details
          // this.editingLabel = ''
        }
        else {
          this.toastr.error(res.details)
          this.label_lst[index].name = this.editingLabel

        }
      },(error)=>{
        this.toastr.error(error)
        console.log('error')
        this.label_lst[index].bln_disabled = true;
        this.label_lst[index].name = this.editingLabel
      })
    }
    else {
      this.label_lst[index].bln_disabled = true;
      this.editingLabel = ''
    }
  }

  deleteLabel(index:any) {
    
    this.backendService.deleteData('notes/labels?pk='+JSON.stringify(this.label_lst[index].id)).subscribe((res)=> {
      if(res.success) {
        console.log('success');
        this.label_lst.splice(index, 1);
      }
      else {
        this.toastr.error(res.details)
      }
    },(error)=>{
      this.toastr.error(error)
      console.log('error')
    })
    
  }
  saveNewLabel() {
    console.log(this.textContent, this.newLabelTitle);
    if(this.textContent == null || this.textContent == undefined || this.textContent == '') {
      return 0
    }
    else if(this.newLabelTitle == null || this.newLabelTitle == undefined || this.newLabelTitle == '') {
      return 0
    }
    else {
      let dctData:any = {
        'title': this.newLabelTitle, 
        'description': this.textContent,
        'pin_bln': this.bln_pin,
        'archive_bln': this.bln_archive,
        'labels': this.selectedLabels.map((label:any) => label.id)
      }
      if (this.bg_color) {
        dctData['bg_color']= this.bg_color
      }
      if (this.bg_image) {
        dctData['bg_image']= this.bg_image
      }
      if (this.collaborator_lst.length>0) {
        dctData['collaborators']= this.collaborator_lst
      }
      this.backendService.postData('notes/', dctData).subscribe((res)=> {
        if(res.success) {
          console.log('success');
          this.noteAdded.emit(res.details);
          this.modalService.dismissAll()
          this.clearData()
          // console.log(this.home?.notes_lst);
        }
        else {
          this.toastr.error(res.details)
        }
      },(error)=>{
        this.toastr.error(error)
        console.log('error')
      })
      return 1
    }
  }

  clearData() {
    this.textContent = null
    this.newLabelTitle = null
    this.bg_color = null
    this.bg_image = null
    this.selectedLabels = []
    this.bln_archive = false
    this.bln_pin = false
    this.collaborator_lst = []
    this.collaborator_email = ''
    this.emailError = null
  }

  openLabelsMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.labelsMenuTrigger.openMenu();
  }

  onLabelSelectionChange(label: any, event: MatCheckboxChange): void {
    // event.stopPropagation(); // Prevent the event from closing the menu
    
    if (label.selected) {
      this.selectedLabels.push(label);
    } else {
      this.removeLabel(label)
    }
    console.log(this.selectedLabels);
  }
  removeLabel(label: any) {
    const index = this.selectedLabels.indexOf(label);
    if (index > -1) {
        this.selectedLabels.splice(index, 1);
    }
    this.label_lst.forEach((ele:any)=>{
      if (ele.id == label.id) {
        ele.selected = false
      }
    })
  }

  refreshPage() {
    window.location.reload()
  }
  loadNotesByLabelsFn(label:any, id:any) {
    this.searchQuery = ''
    if(id != 0) {
      localStorage.setItem('page', JSON.stringify(id))
      localStorage.setItem('active', label)
      this.loadNotesByLabels.emit(JSON.stringify(id))
      this.activeOption = label
    }
    else {
      localStorage.setItem('page', label)
      localStorage.setItem('active', label)
      this.loadNotesByLabels.emit(label)
      this.activeOption = label
    }
  }
  isSelected(data:any, type:any) {
    if (type == 'color') {
      return data == this.bg_color
    }
    else {
      return data == this.bg_image
    }
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

  addCollaborator() {
    if (!this.emailError && this.collaborator_email) {
      this.collaborator_lst.push(this.collaborator_email);
      this.collaborator_email = '';
    }
  }

  removeCollaborator(index: number) {
    this.collaborator_lst.splice(index, 1);
  }

  onSearch() {
    if (this.searchQuery) {
      this.loadNotesBySearch.emit(this.searchQuery)
    }
    else {
      this.exitSearch()
    }
  }

  exitSearch() {
    this.searchQuery = ''
    let page= localStorage.getItem('page')
    this.loadNotesByLabels.emit(page)
  }

  viewChangedFn() {
    this.viewChanged.emit(this.bln_list_view)
  }

  pageModeFn() {
    const body = document.body;  // Get the body element
    if (this.bln_light_mode) {
      body.classList.remove('dark');  // Remove 'dark' class in light mode
      localStorage.setItem('page_mode', 'light')
      this.pageModeChanged.emit('light')
    } else {
      body.classList.add('dark');  // Add 'dark' class in dark mode
      localStorage.setItem('page_mode', 'dark')
      this.pageModeChanged.emit('dark')
    }
  }
}
