import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = '208977b833d444b4ba62099c99'; // Your API key

  constructor(private http: HttpClient) {}

  getMetarData(lat: number, lon: number, radius: number): Observable<any> {
    // Construct the API URL with query parameters
    const url = `https://api.checkwx.com/metar/lat/${lat}/lon/${lon}/radius/${radius}/decoded`;
    const params = new HttpParams().set('x-api-key', this.apiKey);

    // Send GET request to fetch METAR data
    return this.http.get(url, { params });
  }

  getTafData(lat: number, lon: number, radius: number): Observable<any> {
    // Construct the API URL with query parameters
    const url = `https://api.checkwx.com/taf/lat/${lat}/lon/${lon}/radius/${radius}/decoded`;
    const params = new HttpParams().set('x-api-key', this.apiKey);

    // Send GET request to fetch METAR data
    return this.http.get(url, { params });
  }
}
