import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService, User } from '../../auth/auth.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent implements OnInit {
  users: any[] = [];
  loading = false;
  editUser: any = null;
  saving = false;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.api.getUsers().subscribe({
      next: (u) => { this.users = u || []; this.loading = false; },
      error: (err) => { console.error('Error cargando usuarios', err); this.loading = false; }
    });
  }

  openEdit(user: any) {
    // create a shallow copy for editing
    this.editUser = { ...user };
  }

  closeEdit() {
    this.editUser = null;
  }

  saveUser() {
    if (!this.editUser || !this.editUser.id) return;
    this.saving = true;
    const payload = {
      name: this.editUser.name,
      email: this.editUser.email,
      role: this.editUser.role,
      is_admin: this.editUser.is_admin
    };
    this.api.updateUser(this.editUser.id, payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.closeEdit();
        this.loadUsers();
        alert('Usuario actualizado correctamente');
      },
      error: (err) => {
        console.error('Error actualizando usuario', err);
        this.saving = false;
        alert('Error actualizando usuario');
      }
    });
  }
}
