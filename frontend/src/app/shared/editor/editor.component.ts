import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    QuillModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {
  private _textContent: string = '';

  @Input()
  get textContent(): string {
    return this._textContent;
  }
  set textContent(val: string) {
    this._textContent = val;
    this.textContentChange.emit(this._textContent);
  }

  @Output() textContentChange = new EventEmitter<string>();

  onContentChanged(newContent: string) {
    this.textContent = newContent;
  }
}
