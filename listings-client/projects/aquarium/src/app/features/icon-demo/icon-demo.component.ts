import { Component } from '@angular/core';
import { IconComponent, IconName, IconSize } from '@fish-ui/components';

@Component({
  selector: 'app-icon-demo',
  imports: [IconComponent],
  templateUrl: './icon-demo.component.html',
  styleUrl: './icon-demo.component.scss'
})
export class IconDemoComponent {
  selectedIcon: IconName = 'chevron-left';
  selectedSize: IconSize | 'custom' = 'medium';
  selectedColor = 'currentColor';
  customSize = 24;

  navigationIcons: IconName[] = ['chevron-left', 'chevron-right', 'arrow-left', 'arrow-right', 'home'];
  actionIcons: IconName[] = ['search', 'close', 'check', 'refresh', 'settings', 'plus', 'minus', 'edit', 'delete'];
  statusIcons: IconName[] = ['heart', 'star', 'info', 'warning', 'error', 'success'];
  contentIcons: IconName[] = ['card', 'badge', 'button', 'spinner', 'text', 'image', 'file', 'folder'];
  uiIcons: IconName[] = ['eye', 'eye-off', 'layout', 'grid', 'list', 'menu', 'dots'];
  aquariumIcons: IconName[] = ['fish', 'wave', 'anchor'];
  toolIcons: IconName[] = ['code', 'terminal', 'book', 'target', 'link'];

  sizes = ['small', 'medium', 'large'];
  colors = ['currentColor', '#00bcd4', '#26a69a', '#ff7043', '#f57c00', '#757575'];

  onIconChange(icon: string) {
    this.selectedIcon = icon as IconName;
  }

  onSizeChange(size: string) {
    this.selectedSize = size as IconSize | 'custom';
  }

  onColorChange(color: string) {
    this.selectedColor = color;
  }

  onCustomSizeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.customSize = parseInt(target.value, 10);
  }
}
