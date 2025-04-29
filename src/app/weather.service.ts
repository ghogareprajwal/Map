import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})



export class WeatherService {
  private apiKey = '208977b833d444b4ba62099c99'; // Your API key

  private apiUrl = 'https://api.tomorrow.io/v4/weather/forecast';
  private apiKey1 = '3lOulvRZVgNVIMNqlwUbZn6BTL1kuuVV';

  private readonly url = 'https://api.tomorrow.io/v4/timelines';

  private windyApiUrl = 'https://api.windy.com/api/point-forecast/v2';
  private windyApiKey = 'eMGR1bJuT2FPWbh5COeb70RvulUuyfzt'





  constructor(private http: HttpClient) { }



  getWindData(lat: number, lon: number) {

    const now = new Date();

    // Round to next full hour
    const startTime = new Date(now);
    startTime.setMinutes(0, 0, 0);
    if (now.getMinutes() > 0 || now.getSeconds() > 0) {
      startTime.setHours(startTime.getHours() + 1);
    }

    // Add 24 hours
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 24);


    const body = {
      location: `${lat}, ${lon}`,
      fields: ["windSpeed",
        "windDirection"],
      units: "metric",
      timesteps: ["1h"],
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      dailyStartHour: 6
    };

    const headers = new HttpHeaders({
      'Accept-Encoding': 'deflate, gzip, br',
      'accept': 'application/json',
      'content-type': 'application/json'
    });

    return this.http.post(this.url + `?apikey=${this.apiKey1}`, body, { headers });
  }

  fetchWindData(lat:number,lon:Number){
    const body = {
      lat: lat,
      lon: lon,
      model: "gfs",
      parameters: ["wind", "windGust"],
      levels: ["surface", "800h", "300h"], // or ["100m"], etc
      key: this.windyApiKey
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.windyApiUrl, body, { headers });
  }




  getForecast(lat: number, lon: number): Observable<any> {
    const url = `${this.apiUrl}?location=${lat},${lon}&apikey=${this.apiKey1}`;
    return this.http.get(url);
  }

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
