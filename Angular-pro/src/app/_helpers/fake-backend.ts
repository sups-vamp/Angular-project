import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User } from '@app/_models';

const users: User[] = [{ id: 1, username: 'user1', password: 'user1', firstName: 'Alexa', lastName: 'Douglas', role:'user1' },
                        { id: 2, username: 'user2', password: 'user2', firstName: 'James', lastName: 'Marsahall', role:'user2'},
                        { id: 3, username: 'user3', password: 'user3', firstName: 'John', lastName: 'Wade', role:'user3' },
                        { id: 4, username: 'user4', password: 'user4', firstName: 'Mona', lastName: 'Das', role:'user4'},
                        { id: 5, username: 'user5', password: 'user5', firstName: 'Supriya', lastName: 'Das', role:'Admin1'},
                        { id: 6, username: 'user6', password: 'user6', firstName: 'Lalitha', lastName: 'Srivalli', role:'Admin2'}];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) return error('Username or password is incorrect');
            return ok({
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            })
        }

        function getUsers() {
            if (!isLoggedIn()) return unauthorized();
            return ok(users);
        }

        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            return headers.get('Authorization') === `Basic ${window.btoa('user1:user1')}` || 
            `Basic ${window.btoa('user2:user2')}` ||`Basic ${window.btoa('user3:user3')}` ||
            `Basic ${window.btoa('user5:user5')}` ||`Basic ${window.btoa('user4:user4')}` ||
            `Basic ${window.btoa('user6:user6')}`;
        }
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};