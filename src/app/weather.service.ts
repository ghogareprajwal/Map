import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiKey = '7a35596df5724e36a44ab077e8';

  constructor(private http: HttpClient) { }

  getMetarData(lat: number, lon: number, radius: number): Observable<any> {
    const url = `https://api.checkwx.com/metar/lat/${lat}/lon/${lon}/radius/${radius}/decoded?x-api-key=${this.apiKey}`;
    console.log(url)
    // Add the API key as a query parameter
    const params = new HttpParams().set('x-api-key', this.apiKey);
    // Send the GET request with the query parameters
    return this.http.get(url, { params });
  }

}
