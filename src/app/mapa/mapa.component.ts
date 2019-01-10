import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Lugar } from '../interfaces/Lugar';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {
  @ViewChild('map') mapaElement: ElementRef;
  map: google.maps.Map;

  marcadores: google.maps.Marker[] = [];
  infoWindows: google.maps.InfoWindow[] = [];

  lugares: Lugar[] = [
    {
      nombre: 'Udemy',
      lat: 37.784679,
      lng: -122.395936
    },
    {
      nombre: 'Bahía de San Francisco',
      lat: 37.798933,
      lng: -122.377732
    },
    {
      nombre: 'The Palace Hotel',
      lat: 37.788578,
      lng: -122.401745
    }
  ];

  constructor() { }

  ngOnInit() {
    this.cargarMapa();
  }

  cargarMapa() {
    const latLng = new google.maps.LatLng(37.784679, -122.395936);
    const opciones: google.maps.MapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapaElement.nativeElement, opciones);

    this.map.addListener('click', (coors) => {
      const nuevoMarcador: Lugar = {
        nombre: 'Nuevo lugar',
        lat: coors.latLng.lat(),
        lng: coors.latLng.lng(),
        id: new Date().toISOString()
      };
      this.agregarMarcador(nuevoMarcador);
      // Emitir evento de socket, agregar marcador
    });

    for (const lugar of this.lugares) {
      this.agregarMarcador(lugar);
    }
  }

  agregarMarcador(marcador: Lugar) {
    const latLng = new google.maps.LatLng(marcador.lat, marcador.lng);
    const marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      draggable: true
    });

    this.marcadores.push(marker);

    const contenido = `<b>${marcador.nombre}</b>`;
    const infoWindow = new google.maps.InfoWindow({
      content: contenido
    });

    this.infoWindows.push(infoWindow);

    google.maps.event.addDomListener(marker, 'click', () => {
      this.infoWindows.forEach(infoW => infoW.close());
      infoWindow.open(this.map, marker);
    });

    google.maps.event.addDomListener(marker, 'dblclick', (coors) => {
      marker.setMap(null);
      // Disparar evento de socket para borrar marcador
    });

    google.maps.event.addDomListener(marker, 'drag', (coors) => {
      const nuevoMarcador = {
        lat: coors.latLng.lat(),
        lng: coors.latLng.lng(),
        nombre: marcador.nombre
      };
      console.log(nuevoMarcador);
      // Disparar evento de socket para mover marcador
    });
  }
}
