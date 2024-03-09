import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss'],
})
export class ClassesComponent implements OnInit {
  @Input() items: string[] = [];
  @Input() selectedItems: string[] = [];
  @Input() title = '';

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();

  filteredItems: string[] = [];
  workingSelectedValues: string[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.filteredItems = [...this.items];
    console.log(this.filteredItems);
    this.workingSelectedValues = [...this.selectedItems];
  }

  trackItems(index: number, item: any) {
    return item;
  }

  cancelChanges() {
    this.modalCtrl.dismiss({ selectedClasses: this.selectedItems });
  }

  confirmChanges() {
    this.modalCtrl.dismiss({ selectedClasses: this.workingSelectedValues });
  }

  searchbarInput(ev) {
    this.filterList(ev.target.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined) {
      this.filteredItems = [...this.items];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredItems = this.items.filter((item) => {
        return String(item).toLowerCase().includes(normalizedQuery);
      });
    }
  }

  isChecked(value: string) {
    return this.workingSelectedValues.find((item) => item === value);
  }

  checkboxChange(ev, val) {
    console.log(ev);
    //const { checked, value } = ev.detail;
    const checked = ev.checked;

    if (checked) {
      this.workingSelectedValues = [...this.workingSelectedValues, val];
    } else {
      this.workingSelectedValues = this.workingSelectedValues.filter(
        (item) => item !== val
      );
    }
  }

  selectAll(ev: any) {
    let checked = ev.checked;
    if (checked) {
      this.workingSelectedValues = [];
      this.workingSelectedValues = [...this.filteredItems];
    } else {
      this.workingSelectedValues = [];
    }
  }
}
