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
    EditorComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  // @ViewChild('toolbar-container') toolbarContainer: ElementRef;
  @Input() notes_lst: any[] = [];
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

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.cdr.detectChanges();
  //   if (changes['notes_lst']) {
  //     this.reorderItems();
  //   }
  // }

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
    return 4;
  } else if (containerWidth >= 1200) {
    return 3;
  } else if (containerWidth >= 900) {
    return 2;
  } else {
    return 1;
  }
}


  ngOnInit(): void {
    this.getData()
  }
  getData() {
    this.backendService.getData('notes/').subscribe((res)=> {
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
  // ngAfterViewChecked() {
  //   this.reorderItems();
  // }

}
