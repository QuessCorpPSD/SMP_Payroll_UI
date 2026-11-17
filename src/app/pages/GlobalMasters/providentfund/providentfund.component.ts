import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, InjectionToken, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProvidentfundaddComponent } from '../providentfundadd/providentfundadd.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ProvidentfundService } from '../../../Service/GlobalMasters/providentfund.service';
import { IPFService } from '../../../Repository/GlobalMasters/IPF.service';
import * as XLSX from 'xlsx';
export const Pay_Token = new InjectionToken<IPFService>('Pay_Token');

@Component({
  selector: 'app-providentfund',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatTableModule, MatPaginatorModule, FormsModule],
  templateUrl: './providentfund.component.html',
  styleUrl: './providentfund.component.css',
  providers: [
    {
      provide: Pay_Token,
      useClass: ProvidentfundService,
    }
  ]
})

export class ProvidentfundComponent implements AfterViewInit {

  showTable = false;
  getCap: any;
  capType: any = "";
  getPay:any="";
  paycode: any="";
  pfSearch: any;
  searchText: string = "";
  dataSource = new MatTableDataSource<any>([]);
  isLoading: boolean = false;

  constructor(private dialog: MatDialog, @Inject(Pay_Token) private service: IPFService,) { }

  uploadDisplayedColumns: string[] = ['Action','From_Value', 'To_Value', 'Paycode', 'Category', 'RegularSSS', 'EffectiveDate'];

  uploadedData: any[] = []; // no mock data
  uploadedDataSource = new MatTableDataSource<any>(this.uploadedData);

  filterValues: any = {
    payCode: '', description: '', capnoncap: '', fromvalue: '',
    tovalue: '', criteriatypename: '', criteria: '', formula: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.uploadedDataSource.paginator = this.paginator;
  }


  ngOnInit() {
    this.bindCap();
    this.bindPayCode();
  }

  bindCap() {
    this.service.getCap().subscribe({
      next: res => {
        this.getCap = res.Data
      }
    });
  }
   bindPayCode() {
    this.service.getPayCode().subscribe({
      next: res => {
        this.getPay = res.Data
      }
    });
  }

  applyFilters() {
    const filterValue = this.searchText?.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  onSearch() {
    this.showTable = true;
    this.isLoading = true;
    const CapType = this.capType || 0
    const Paycode = this.paycode || 0
    this.service.Search(CapType,Paycode).subscribe({

      next: (res) => {
        this.pfSearch = res.Data.data.Table0;
        if (this.pfSearch && this.pfSearch.length > 0) {
          this.dataSource = new MatTableDataSource(this.pfSearch);
          this.dataSource.paginator = this.paginator;
          this.uploadDisplayedColumns = ['Action', 'From_Value', 'To_Value','Paycode', 'Category', 'EffectiveDate'];
        } else {
          this.dataSource.data = [];
          alert('No data found for the selected criteria');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading PF details', err);
        alert('Failed to load PF Details');
        this.isLoading = false;
      },
    });
  }

  exportToExcel(): void {
    this.isLoading = true;
    const CapType = this.capType || 99;

    this.service.exportToExcel(CapType).subscribe({
      next: (res) => {
        try {
          const jsonData = res?.Data?.data?.Table0;

          //  Check if Data is not an array or empty
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            alert('No data available for the cap/noncap type.');
            this.isLoading = false;
            return;
          }

          // Create Excel file
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();

          XLSX.utils.book_append_sheet(wb, ws, 'salaryData');

          const timestamp = new Date().toISOString().split('T')[0];
          const fileName = `providentfund${timestamp}.xlsx`;

          XLSX.writeFile(wb, fileName);
          this.isLoading = false;
        } catch (err) {
          console.error('Error exporting to Excel:', err);
          alert('An error occurred while exporting data.');
        }
      },
      error: (err) => {
        console.error('Error loading data for export', err);
        alert('Failed to load data from server.');
        this.isLoading = false;
      },
    });
  }

  deleteProvidentFund(row: any) {

    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    this.isLoading = true;

    const payload = {
      ProvidentFundId: row.ProvidentFundId
    };

    this.service.deletePf(payload).subscribe({
      next: res => {
        alert(res.Data?.response);
        this.onSearch();   // reload grid
      },
      error: err => {
        console.error(err);
        alert('Delete failed');
        this.isLoading = false;

      }
    });
  }

  AddPFOpen() {
    this.dialog.open(ProvidentfundaddComponent, {
      width: '90%',
      height: '78vh',
      disableClose: true,
      data: { example: 'Hello from parent!' }
    });
  }



  editPFOpen(row: any) {
    console.log('editdata',row);
    const dialogRef = this.dialog.open(ProvidentfundaddComponent, {
      width: '90%',
      height: '78vh',
      disableClose: true,
      data: { mode: 'edit', row: row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this.onSearch();
      }
    });
  }

  getEditData(providentFundId: number) {
    this.isLoading = true;
    this.service.getEditData(providentFundId).subscribe({
      next: (res) => {
        this.pfSearch = res.Data.data.Table0;
        if (this.pfSearch && this.pfSearch.length > 0) {
          this.editPFOpen(this.pfSearch);
        } else {
          alert('No data found for the selected criteria');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error Failed to load PF Details', err);
        alert('Failed to load PF Details');
        this.isLoading = false;
      },
    });
  }

}

