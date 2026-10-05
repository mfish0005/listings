import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName = 
  // Navigation
  | 'chevron-left' 
  | 'chevron-right' 
  | 'arrow-left' 
  | 'arrow-right'
  | 'home'
  // Actions
  | 'search'
  | 'close'
  | 'check'
  | 'refresh'
  | 'settings'
  | 'plus'
  | 'minus'
  | 'edit'
  | 'delete'
  | 'download'
  | 'upload'
  // Status
  | 'heart'
  | 'star'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  // Content
  | 'card'
  | 'badge'
  | 'button'
  | 'spinner'
  | 'text'
  | 'image'
  | 'file'
  | 'folder'
  // UI/Layout
  | 'eye'
  | 'eye-off'
  | 'layout'
  | 'grid'
  | 'list'
  | 'menu'
  | 'dots'
  // Fish themed
  | 'fish'
  | 'wave'
  | 'anchor'
  // Development/Tools
  | 'code'
  | 'terminal'
  | 'book'
  | 'target'
  | 'link';

export type IconSize = 'small' | 'medium' | 'large' | number;

@Component({
  selector: 'fish-icon',
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {
  @Input() name!: IconName;
  @Input() size: IconSize = 'medium';
  @Input() color?: string;
  @Input() strokeWidth: number = 2;
  
  get iconSize(): number {
    if (typeof this.size === 'number') {
      return this.size;
    }
    
    switch (this.size) {
      case 'small': return 16;
      case 'medium': return 24;
      case 'large': return 32;
      default: return 24;
    }
  }
  
  get viewBox(): string {
    return '0 0 24 24';
  }
  
  get iconClasses(): string {
    const classes = ['fish-icon'];
    
    if (typeof this.size === 'string') {
      classes.push(`fish-icon--${this.size}`);
    }
    
    classes.push(`fish-icon--${this.name}`);
    
    return classes.join(' ');
  }
}
