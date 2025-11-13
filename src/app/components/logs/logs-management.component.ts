import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-logs-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs-management.component.html',
  styleUrl: './logs-management.component.css'
})
export class LogsManagementComponent implements OnInit {
  logs: any[] = [];
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.api.getLogs().subscribe({
      next: (l) => { this.logs = l || []; this.loading = false; },
      error: (err) => { console.error('Error cargando logs', err); this.loading = false; }
    });
  }

  deleteLog(id: number) {
    if (!confirm('¿Borrar este log?')) return;
    this.api.deleteLog(id).subscribe({
      next: () => { alert('Log borrado'); this.loadLogs(); },
      error: (err) => { console.error('Error borrando log', err); alert('Error borrando log'); }
    });
  }
}
