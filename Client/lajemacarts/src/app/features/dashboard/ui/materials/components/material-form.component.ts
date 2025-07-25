import { Component } from '@angular/core';

@Component({
  selector: 'lajemacarts-material-form',
  template: `
    <h2>Material Form</h2>
    <form>
      <label for="name">Name:</label>
      <input type="text" id="name" name="name">
      <button type="submit">Save</button>
    </form>
  `,
  standalone: true,
})
export class MaterialFormComponent {}
