import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-customers',
  templateUrl: './view-customers.component.html',
  styleUrls: ['./view-customers.component.css'],
})
export class ViewCustomersComponent implements OnInit {
  customerData: any[] = [];
  filteredCustomerData: any[] = []; // Store filtered data
  totalCustomerCount: number = 0;
  currentPage: number = 1;
  pageSizes: number[] = [5, 10, 15, 20, 30, 40, 50];
  pageSize: number = this.pageSizes[0];
  searchQuery: string = '';
  isSearch: boolean = false;
  totalPages: number = 0;
  hasNext: boolean = false;
  hasPrevious: boolean = false;

  constructor(private adminService: AdminService, private location: Location) {}

  ngOnInit(): void {
    this.getCustomers();
  }

  goBack(): void {
    this.location.back();
  }

  getCustomers(): void {
    this.adminService.getCustomers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        // Parse pagination headers
        const headers = {
          currentPage: parseInt(response.headers.get('X-Current-Page') || '1', 10),
          hasNext: response.headers.get('X-Has-Next') === 'true',
          hasPrevious: response.headers.get('X-Has-Previous') === 'true',
          totalPages: parseInt(response.headers.get('X-Total-Pages') || '0', 10),
          totalCount: parseInt(response.headers.get('X-Total-Count') || '0', 10),
        };

        // Set pagination properties
        this.currentPage = headers.currentPage;
        this.hasNext = headers.hasNext;
        this.hasPrevious = headers.hasPrevious;
        this.totalPages = headers.totalPages;
        this.totalCustomerCount = headers.totalCount;

        // Set customer data
        this.customerData = response.body || [];
        this.filteredCustomerData = [...this.customerData]; // Initially, filtered data is the same as customerData
      },
      error: () => {
        this.customerData = [];
        this.filteredCustomerData = [];
        this.totalCustomerCount = 0;
        this.totalPages = 0;
        this.hasNext = false;
        this.hasPrevious = false;
      },
    });
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.getCustomers();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.filteredCustomerData = this.customerData.filter((customer) => {
        const searchLower = this.searchQuery.toLowerCase();
        return (
          customer.customerFirstName.toLowerCase().includes(searchLower) ||
          customer.customerLastName.toLowerCase().includes(searchLower)
        );
      });
      this.isSearch = true;
    } else {
      this.resetSearch();
    }
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.isSearch = false;
    this.filteredCustomerData = [...this.customerData]; // Reset filtered data to original customer data
  }

  calculateSRNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getCustomers();
    }
  }

  viewDocument(customer: any): void {
    console.log('View documents for:', customer);
  }

  viewPolicies(customer: any): void {
    console.log('View policies for:', customer);
  }
}
