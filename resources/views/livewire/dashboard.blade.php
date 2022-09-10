<div>
    <div class="container-xl">
        <div class="page-header d-print-none">
            <div class="row g-2 align-items-center">
                <div class="col">
                    <div class="page-pretitle">
                        Overview
                    </div>
                    <h2 class="page-title">
                        Backups
                    </h2>
                </div>
                <div class="col-12 col-md-auto ms-auto d-print-none">
                    <div class="btn-list">
                        <a href="{{ route('add-account') }}" class="btn btn-primary d-none d-sm-inline-block">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24"
                                 viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Account
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="page-body">
        <div class="container-xl">

            <div wire:ignore>
            @if(session()->has('success'))
                <div class="alert alert-success" role="alert">
                    <div class="text-muted">{{ session()->get('success') }}</div>
                </div>
            @endif
            </div>

            <div class="card">
                <div wire:init="loadVariables" class="card-body">
                    <div class="datagrid">
                        <div class="datagrid-item">
                            <div class="datagrid-title">Accounts Added</div>
                            <div class="datagrid-content">
                                @if($accountAddedCount > 0)
                                    <a href="{{ route('all-accounts') }}">
                                        {{ $accountAddedCount }}
                                    </a>
                                @else
                                    {{ $accountAddedCount }}
                                @endif
                            </div>
                        </div>
                        <div class="datagrid-item">
                            <div class="datagrid-title">Accounts Syncing</div>
                            <div class="datagrid-content">
                                {{ $accountSyncingCount }}
                            </div>
                        </div>
                        <div class="datagrid-item">
                            <div class="datagrid-title">Emails Processed</div>
                            <div class="datagrid-content">{{ $emailCounts['processed'] }}</div>
                        </div>
                        <div class="datagrid-item">
                            <div class="datagrid-title">Emails Archived</div>
                            <div class="datagrid-content">{{ $emailCounts['successful'] }}</div>
                        </div>
                        <div class="datagrid-item">
                            <div class="datagrid-title">Failures</div>
                            <div class="datagrid-content">{{ $emailCounts['failed'] }}</div>
                        </div>
                        <div class="datagrid-item">
                            <div class="datagrid-title">Disk Usage (8 GB)</div>
                            <div class="datagrid-content">
                                <div class="progress progress-sm">
                                    <div class="progress-bar" style="width: {{ $percentDiskUsed }}%" role="progressbar" aria-valuenow="{{ $percentDiskUsed }}" aria-valuemin="0" aria-valuemax="100" aria-label="{{ $percentDiskUsed }}% Used">
                                        <span class="visually-hidden">{{ $percentDiskUsed }}% Used</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

