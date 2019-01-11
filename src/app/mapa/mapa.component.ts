import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Lugar } from '../interfaces/Lugar';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../services/websocket.service';

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

  lugares: Lugar[] = [];

  constructor(
    private http:HttpClient,
    public _webSocket: WebsocketService
  ) { }

  ngOnInit() {
    this.escucharSockets();
    this.http.get('http://localhost:5000/marcadores')
      .subscribe((lugares:Lugar[]) => {
        this.lugares = lugares;
        this.cargarMapa();
      });
  }

  escucharSockets() {
    //nuevo-marcador
    this._webSocket.listen('nuevo-marcador').subscribe((marcador:Lugar) => {
      this.agregarMarcador(marcador);
    })
    
    //borrar-marcador
    this._webSocket.listen('borrar-marcador').subscribe((id:string) => {
      let marker:google.maps.Marker = this.marcadores.find(marcador => marcador.getTitle() === id);
      marker.setMap(null);
    });

    //mover-marcador
    this._webSocket.listen('mover-marcador').subscribe((marcador:Lugar) => {
      console.log(marcador);
      let marker:google.maps.Marker = this.marcadores.find(marker => marker.getTitle() === marcador.id);
      const latLng = new google.maps.LatLng(marcador.lat, marcador.lng);
      marker.setPosition(latLng);
    });
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
      this._webSocket.emit('nuevo-marcador', nuevoMarcador);
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
      draggable: true,
      title: marcador.id
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
      // Disparar evento de socket para borrar marcador
      this._webSocket.emit('borrar-marcador', marker.getTitle());
      marker.setMap(null);
    });

    google.maps.event.addDomListener(marker, 'drag', (coors) => {
      const nuevoMarcador = {
        lat: coors.latLng.lat(),
        lng: coors.latLng.lng(),
        nombre: marcador.nombre,
        id: marker.getTitle()
      };
      // Disparar evento de socket para mover marcador
      this._webSocket.emit('mover-marcador', nuevoMarcador);
    });
  }
}
