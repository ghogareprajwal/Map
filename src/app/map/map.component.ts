import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { WeatherService } from '../weather.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

  private markersSet = new Set<string>();
  private map: any;
  errorMessage: string = '';
  private markersLayer = L.layerGroup(); // Layer group to manage markers
  private markers: L.Marker[] = []; // Array to store all markers
  isMetarDataVisible: boolean = false;
  isTafDataVisible: boolean = false;
  tafTableData: any[] = [];

  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([11.136111, 75.955], 10); // Default coordinates for India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Event listener for map view change (pan or zoom)
    this.map.on('moveend', () => {
      if (this.isMetarDataVisible) {
        this.fetchMetarData();
      }
      else if (this.isTafDataVisible) {
        this.fetchTafData();
      }
    });

  }

  // Toggle for Astronomical Data
  toggleMetarData(): void {
    if (this.isMetarDataVisible) {
      this.clearData();
    } else {
      this.fetchMetarData();
    }
    this.isMetarDataVisible = !this.isMetarDataVisible;
  }

  toggleTafData(): void {
    if (this.isTafDataVisible) {
      this.clearData();
    } else {
      this.fetchTafData();
    }
    this.isTafDataVisible = !this.isTafDataVisible;
  }


  // Clear markers from the map
  clearData(): void {
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];
  }

  // Fetch METAR data based on current map view and generated dates
  fetchMetarData(): void {
    const currentLat = this.map.getCenter().lat;
    const currentLon = this.map.getCenter().lng;
    const radius = 200; // Adjust radius as needed

    this.weatherService.getMetarData(currentLat, currentLon, radius).subscribe({
      next: (data: any) => {
        if (data && data.data) {
          console.log('Fetched METAR data:', data);
          this.displayMetarDataOnMap(data);
        } else {
          console.error('No METAR data received');
        }
      },
      error: (error) => {
        console.error('Error fetching METAR data:', error);
      },
    });
  }

  // Display METAR data markers on the map
  displayMetarDataOnMap(metarData: any): void {
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
        <strong>Conditions:</strong> ${station.conditions?.[0]?.text || 'No conditions available'
        }
      `;
      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker); // Add to layer group
      this.markersLayer.addTo(this.map);
    });
  }

  fetchTafData(): void {
    const currentLat = this.map.getCenter().lat;
    const currentLon = this.map.getCenter().lng;
    const radius = 200; // Adjust radius as needed

    this.weatherService.getTafData(currentLat, currentLon, radius).subscribe({
      next: (data: any) => {
        if (data && data.data) {
          console.log('Fetched TAFOR data:', data);
          this.displayTafDataOnMap(data);
          this.processTafData(data.data);
        } else {
          console.error('No TAFOR data received');
        }
      },
      error: (error) => {
        console.error('Error fetching TAFOR data:', error);
      },
    });
  }

  // Display METAR data markers on the map
  displayTafDataOnMap(data: any): void {
    // Clear existing markers before adding new ones
    this.clearData();

    // Check if data contains stations
    if (data && data.data && Array.isArray(data.data)) {
      data.data.forEach((station: any) => {
        const [lon, lat] = station.station.geometry.coordinates;

        const raw_text = station.raw_text;
        const stationName = station.station.name || 'Unknown Station';

        const markerId = `${lat},${lon}`;
        if (this.markersSet.has(markerId)) {
          // Skip if marker already exists
          return;
        }

        // Add the marker ID to the Set
        this.markersSet.add(markerId);

        const customIcon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Use a valid URL or local icon
          iconSize: [25, 41],  // Marker size
          iconAnchor: [12, 41],  // Anchor point for the icon
          popupAnchor: [1, -34],  // Anchor point for popup
        });

        // Create a new marker and add it to the map
        const marker = L.marker([lat, lon], { icon: customIcon });


        // Create a popup content with METAR details
        const popupContent = `
          <b>Station Name:</b> ${stationName}<br>
          <b>Raw text:</b> ${raw_text} °C<br>

        `;

        marker.bindPopup(popupContent).openPopup();
        this.markersLayer.addLayer(marker); // Add to layer group
        this.markersLayer.addTo(this.map);
      });
    } else {
      console.error('No valid data found');
    }
  }



  processTafData(rawData: any[]): void {
    const newTableData: any[] = []; // Temporary array for new data
    rawData.forEach((station) => {
      const rawText = station.raw_text;
      const icaoCode = station.icao;
      const parsedData = this.parseTafData(rawText, icaoCode);
      newTableData.push(...parsedData);
    });

    // Merge the new data with existing table data, avoiding duplicates
    const existingIcaoCodes = this.tafTableData.map((item) => item["ICAO code"]);
    const mergedData = [...this.tafTableData];

    newTableData.forEach((newRow) => {
      if (!existingIcaoCodes.includes(newRow["ICAO code"])) {
        mergedData.push(newRow);
      }
    });

    this.tafTableData = mergedData; // Update the table data
  }


  parseTafData(rawText: string, icao: string): any[] {
    const rows: any[] = [];
    let serialNo = 1;

    // Split the raw text based on trend indicators like BECMG or TEMPO
    const trendTypes = rawText.match(/BECMG|TEMPO/g) || [];
    const lines = rawText.split(/BECMG|TEMPO/);

    // Get the general information (first part before any trends)
    const generalInfo = lines.shift()?.trim() || "";

    // Match general TAF data
    const genMatch = generalInfo.match(
      /^(\w{4}) (\d{6}Z) (\d{4})\/(\d{4}) ([A-Z0-9]+) (\d{4})? ([\w ]+)?/) || generalInfo.match(
        /TAF (\w{4}) (\d{6}Z) (\d{4})\/(\d{4}) ([A-Z0-9]+) (\d{4})? ([\w ]+)?/) || generalInfo.match(
          /TAF COR (\w{4}) (\d{6}Z) (\d{4})\/(\d{4}) ([A-Z0-9]+) (\d{4})? ([\w ]+)?/
        );

    if (genMatch) {
      const wind = genMatch[5];
      const windDirection = wind.slice(0, 3);
      const windSpeedMatch = wind.match(/(\d{2,3})(KT|MPS)/);
      const windSpeed = windSpeedMatch ? `${windSpeedMatch[1]} ${windSpeedMatch[2]}` : "";

      let visibility = genMatch[6] || "";
      if (/^\d{4}$/.test(visibility)) {
        visibility = `${visibility}`;
      }

      let weatherInfo = "";
      let cloudInfo = "";
      const weatherAndCloudMatch = generalInfo.match(/(FG|RA|HZ|TS|SN|MIFG|DZ|BR|SH|SQ|FZ|GR|SG|UP|VC|FU) ?/g) || [];
      const cloudMatch = generalInfo.match(/(FEW|SCT|BKN|OVC)\d{3}/g) || generalInfo.match(/(NSC)\d{0}/g) || [];

      if (weatherAndCloudMatch.length > 0) {
        weatherInfo = weatherAndCloudMatch.join(" ").trim();
      }

      if (cloudMatch.length > 0) {
        cloudInfo = cloudMatch.join(", ");
      }

      rows.push({
        "Sl no": serialNo++,
        Type: "GEN",
        "ICAO code": genMatch[1],
        "Issue Time": genMatch[2],
        "Valid From [TAF]": genMatch[3],
        "Valid Until [TAF]": genMatch[4],
        "Valid From [Type Specific]": "",
        "Valid Until [Type Specific]": "",
        "Wind Direction": windDirection,
        "Wind Speed": windSpeed,
        Visibility: visibility,
        "Weather Information": weatherInfo,
        "Cloud Information": cloudInfo,
        Trend: "",
      });
    }

    // Process trend data like BECMG, TEMPO
    lines.forEach((line, index) => {
      const trendType = trendTypes[index] || "-";

      const trendMatch = line.trim().match(
        /(\d{3,4})\/(\d{3,4})\s*(?:(VRB|\d{3})\s*(\d{2,3})(KT|MPS))?\s*(\d{4}(?!KT))?\s*(FG|RA|HZ|TS|SN|MIFG|DZ|BR|SH|SQ|FZ|GR|SG|UP|VC|FU)?(\s*(FEW|SCT|BKN|OVC)\d{3}|NSC)?/i
      );

      if (trendMatch) {
        const validFrom = trendMatch[1] || "-";
        const validUntil = trendMatch[2] || "-";
        const windDirection = trendMatch[3] || "-";
        const windSpeed = trendMatch[4] ? `${trendMatch[4]} ${trendMatch[5] || ""}` : "-";
        const visibility = trendMatch[6] || "-";
        const weatherInfo = trendMatch[7] || "-";
        const cloudInfo = trendMatch[8] || "-";

        rows.push({
          "Sl no": serialNo++,
          Type: trendType,
          "ICAO code": icao,
          "Issue Time": "",
          "Valid From [TAF]": "",
          "Valid Until [TAF]": "",
          "Valid From [Type Specific]": validFrom,
          "Valid Until [Type Specific]": validUntil,
          "Wind Direction": windDirection,
          "Wind Speed": windSpeed,
          Visibility: visibility,
          "Weather Information": weatherInfo,
          "Cloud Information": cloudInfo,
          Trend: trendType,
        });

      } else {
        console.error(`Failed to parse trend line: ${line.trim()} for ICAO: ${icao}`);
      }
    });
    return rows;
  }
}
