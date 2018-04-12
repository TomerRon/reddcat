import { Component, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'rc-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent {

  @Input() comment;
  @Input() isNew;
  opened;

  constructor() {
    this.opened = false;
  }

  trunc(str) {
    return str.length > 200 ? str.substr(0, 197) + '...' : str;
  }

  dateToWords(d) {
    return moment(d).format('MMMM Do YYYY, h:mm:ss a');
  }

  dateToTimeFromNow(d) {
    return moment(d).fromNow();
  }
}
