import { Component,OnInit } from '@angular/core';
import * as L from 'leaflet';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  private map: any;
  private lat = 20.5937; 
  private lon = 78.9629; 
  private markers: L.Marker[] = []; 
  metarData: any;
  errorMessage: string = ''; 
  private markersLayer = L.layerGroup(); // Layer group to manage markers
  private radius: number = 150;
  private markersSet = new Set<string>();

  constructor(private weatherService: WeatherService) {
    
   }

  ngOnInit(): void {
    this.initializeMap();
   

    this.fetchMetarData();
   
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([this.lat,this.lon], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);
   
    this.map.on('zoomend', () => this.fetchMetarData());
  }

  
  private fetchMetarData(): void {
    // Get the map's current bounds
   const center = this.map.getCenter();
    const lat = center.lat;
    const lon = center.lng;

    // Call the service to fetch METAR data
    this.weatherService.getMetarData(lat, lon, this.radius).subscribe(
      (data) => {
        this.addMarkers(data); // Add new markers with the fetched data
      },
      (error) => {
        console.error('Error fetching METAR data:', error);
      }
    );
  }


  private addMarkers(metarData: any): void {
    if (!metarData || !metarData.data || metarData.data.length === 0) {
      console.log('No data to display');
      return;
    }

    metarData.data.forEach((station: any) => {
      const [longitude, latitude] = station.station.geometry.coordinates;

      // Create a unique ID for each marker based on coordinates
      const markerId = `${latitude},${longitude}`;
      if (this.markersSet.has(markerId)) {
        return;
      }

      // Add the marker ID to the set
      this.markersSet.add(markerId);

      // Create a custom marker icon
      const customIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      // Create a marker and add it to the markers layer
      const marker = L.marker([latitude, longitude], { icon: customIcon });
      const popupContent = `
        <strong>Station Name:</strong> ${station.station.name || 'Unknown'}<br>
        <strong>Location:</strong> ${station.station.location}<br>V
        <strong>Temperature:</strong> ${station.temperature?.celsius || 'N/A'} °C<br>
        <strong>Conditions:</strong> ${
          station.conditions?.[0]?.text || 'No conditions available'
        }
      `;
      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker); // Add to layer group
      this.markersLayer.addTo(this.map);
    });
  }
}



