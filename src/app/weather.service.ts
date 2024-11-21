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

    console.log('Request URL:', url); // Log the URL for debugging

    const headers = new HttpHeaders({
      'Accept': 'application/json'  
    });

    return this.http.get(url, { headers }).pipe(
      map(response => {
        console.log('Response Data:', response); 
        return response;
      }),
      catchError(error => {
        console.error('Error fetching METAR data:', error); 
        return of(null); 
      })
    );
  }
}

