import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { UserService, AuthenticationService } from '../_services';

@Component({ templateUrl: './home.component.html', styleUrls: ['./home.component.scss'] })
export class HomeComponent implements OnInit {
    currentUser: any;
    users = [];

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    ngOnInit() {
        this.loadAllUsers();
    }


    private loadAllUsers() {
        this.userService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);
    }
}