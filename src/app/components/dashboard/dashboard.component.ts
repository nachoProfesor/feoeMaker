import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('alumnosChart') alumnosChartRef!: ElementRef;
  @ViewChild('conveniosChart') conveniosChartRef!: ElementRef;

  // Datos de estadísticas
  totalAlumnos = 156;
  totalEmpresas = 42;
  propuestasPendientes = 8;
  conveniosActivos = 23;

  // Información del centro
  nombreCentro = 'IES Valle del Jerte';
  cursosImpartidos = ['DAM', 'DAW', 'ASIR', 'SMR'];
  anoAcademico = '2024/2025';

  // Actividad reciente
  recentActivities = [
    { text: 'Nueva propuesta de FCT para DAM', time: 'Hace 2 horas' },
    { text: 'Convenio firmado con Empresa XYZ', time: 'Hace 5 horas' },
    { text: 'Alumno asignado a empresa ABC', time: 'Ayer' },
    { text: 'Nuevo documento generado', time: 'Hace 2 días' },
    { text: 'Reunión programada con tutor', time: 'Hace 3 días' }
  ];

  private alumnosChart: any;
  private conveniosChart: any;

  ngOnInit(): void {
    // Inicialización de datos
  }

  ngAfterViewInit(): void {
    this.createAlumnosChart();
    this.createConveniosChart();
  }

  private isDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private getTextColor(): string {
    return this.isDarkMode() ? '#f9fafb' : '#111827';
  }

  private getGridColor(): string {
    return this.isDarkMode() ? '#374151' : '#e5e7eb';
  }

  createAlumnosChart(): void {
    const ctx = this.alumnosChartRef.nativeElement.getContext('2d');
    this.alumnosChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['DAM', 'DAW', 'ASIR', 'SMR'],
        datasets: [{
          data: [45, 38, 42, 31],
          backgroundColor: [
            '#6366f1',
            '#8b5cf6',
            '#ec4899',
            '#f59e0b'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: this.getTextColor(),
              font: {
                family: 'Inter'
              }
            }
          }
        }
      }
    });
  }

  createConveniosChart(): void {
    const ctx = this.conveniosChartRef.nativeElement.getContext('2d');
    this.conveniosChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Convenios',
          data: [12, 19, 15, 25, 22, 30],
          backgroundColor: '#6366f1',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: this.getGridColor()
            },
            ticks: {
              color: this.getTextColor(),
              font: {
                family: 'Inter'
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: this.getTextColor(),
              font: {
                family: 'Inter'
              }
            }
          }
        }
      }
    });
  }
}
