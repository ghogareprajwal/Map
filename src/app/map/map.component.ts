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

  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void {
    this.initializeMap();
    const latitude = 40.72;
    const longitude = -73.99;
    const radius = 20;  // Radius in miles, adjust as needed

    this.fetchMetarData(latitude, longitude, radius);
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([40.72,-73.99], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

  }

  fetchMetarData(lat: number, lon: number, radius: number): void {
    this.weatherService.getMetarData(lat, lon, radius).subscribe(
      (data) => {
        this.metarData = data;  // Store the METAR data
        console.log('METAR Data:', this.metarData);  // For debugging
        this.addMarkersToMap();
      },
      (error) => {
        this.errorMessage = 'Failed to load METAR data';
        console.error('Error fetching METAR data:', error);  // For error logging
      }
    );
  }

  private addMarkersToMap(): void {
    if (!this.metarData || !this.metarData.data || this.metarData.data.length === 0) {
      return;
    }
  
    // Loop through METAR stations and add a marker for each one
    this.metarData.data.forEach((station: any) => {
      // Destructure latitude and longitude from station.geometry.coordinates
      const [longitude, latitude] = station.station.geometry.coordinates;
  
      // Fetch temperature and conditions
      const temperature = station.temperature ? station.temperature.celsius : 'N/A';
      const conditions = station.conditions && station.conditions.length > 0
        ? station.conditions[0].text
        : 'No conditions available';
      const stationName = station.station.name || 'Unknown Station';
      const stationLocation = station.station.location || 'Unknown Location';
  
      // Custom marker icon setup to avoid 404 errors
      const customIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Use a valid URL or local icon
        iconSize: [25, 41],  // Marker size
        iconAnchor: [12, 41],  // Anchor point for the icon
        popupAnchor: [1, -34],  // Anchor point for popup
      });
  
      // Create a new marker and add it to the map
      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(this.map);
  
      // Bind a popup with the station's weather information
      const popupContent = `
        <strong>Station Name:</strong> ${stationName}<br>
        <strong>Location:</strong> ${stationLocation}<br>
        <strong>Temperature:</strong> ${temperature} °C<br>
        <strong>Conditions:</strong> ${conditions}<br>
      `;
  
      marker.bindPopup(popupContent).openPopup();
  
      // Optionally, you can store the markers if you need to remove or manage them later
      this.markers.push(marker);
    });
  }


}
