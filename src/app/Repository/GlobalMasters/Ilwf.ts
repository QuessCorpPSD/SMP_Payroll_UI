import { Observable } from 'rxjs';
import { APIResponse } from '../../Models/apiresponse';

export interface ILwf {
    GetState(): Observable<APIResponse>;
    Search(): Observable<APIResponse>;
    Exporttoexcel(payload: any): Observable<APIResponse>;
    GetMonth(): Observable<APIResponse>;
    CreateupdateDelete(payload: any): Observable<APIResponse>;
}