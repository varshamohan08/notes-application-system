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
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { QuillModule } from 'ngx-quill';
import { HomeComponent } from '../home/home.component';
import { EditorComponent } from '../shared/editor/editor.component';
import { MatChipsModule } from '@angular/material/chips';

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
  selectedLabels:any= []
  @ViewChild(HomeComponent) home!: HomeComponent;
  @Output() noteAdded: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('labels') labelsMenuTrigger!: MatMenuTrigger;
  @Output() labelAdded = new EventEmitter<void>();
  @Output() loadNotesByLabels: EventEmitter<any> = new EventEmitter<any>();

  textContent:any=null;


  setActiveOption(option: string) {
    this.activeOption = option;
  }
  open(content:any, size:string,option: string) {
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static'});
    this.activeOption = option;
  }

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef, 
    media: MediaMatcher,
    private backendService: BackendService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnInit(): void {
    this.getLabels()
    if(localStorage.getItem('active')) {
      this.setActiveOption(localStorage.getItem('active') || '')
    }
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
      let dctData = {
        'title': this.newLabelTitle, 
        'description': this.textContent
      }
      this.backendService.postData('notes/', dctData).subscribe((res)=> {
        if(res.success) {
          console.log('success');
          this.textContent = null
          this.newLabelTitle = null
          this.noteAdded.emit(res.details);
          this.modalService.dismissAll()
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
    if(id != 0) {
      localStorage.setItem('page', JSON.stringify(id))
      localStorage.setItem('active', JSON.stringify(label.name))
      this.loadNotesByLabels.emit(JSON.stringify(id))
      this.activeOption = label.name
    }
    else {
      localStorage.setItem('page', label)
      localStorage.setItem('active', label)
      this.loadNotesByLabels.emit(label)
      this.activeOption = label
    }
  }
}
