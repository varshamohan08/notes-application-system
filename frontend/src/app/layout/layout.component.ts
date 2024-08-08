import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BackendService } from '../backend.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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
    FormsModule
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

  setActiveOption(option: string) {
    this.activeOption = option;
  }
  open(content:any,option: string) {
    this.modalService.open(content, { centered: true });
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
}
