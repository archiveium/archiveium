<div>
    <div class="container-xl">
        <div class="page-header d-print-none">
            <div class="row g-2 align-items-center">
                <div class="col">
                    <div class="page-pretitle">
                        Overview
                    </div>
                    <h2 class="page-title">
                        Accounts
                    </h2>
                </div>

                <div class="col-12 btn-list col-md-auto ms-auto d-print-none">
                    <div class="dropdown">
                        <a href="#" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                            {{ $selectedAccount->name }}
                        </a>
                        <div class="dropdown-menu dropdown-menu-demo">
                            @foreach($allAccounts as $account)
                                <a class="dropdown-item" href="#"
                                   wire:click="updateSelectedAccount({{ $account->id }})">
                                    {{ $account->name }} &nbsp;
                                    @if($account->syncing)
                                        <span class="badge bg-green ms-auto"></span>
                                    @else
                                        <span class="badge bg-yellow ms-auto"></span>
                                    @endif
                                </a>
                            @endforeach
                        </div>
                    </div>
                    <span class="d-none d-sm-inline">
                        <a href="{{ route('edit-account', $selectedAccount->id) }}" class="btn btn-blue btn-icon"
                           aria-label="Button">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-pencil" width="24" height="24"
                                 viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                                 stroke-linejoin="round">
                               <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                               <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                               <line x1="13.5" y1="6.5" x2="17.5" y2="10.5"></line>
                            </svg>
                        </a>
                  </span>
                    <span class="d-none d-sm-inline">
                        @if($selectedAccount->syncing)
                            <a wire:click="toggleSyncing({{ $selectedAccount->id }}, false)"
                               class="btn btn-yellow btn-icon"
                               aria-label="Button">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     class="icon icon-tabler icon-tabler-player-pause"
                                     width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                                     fill="none" stroke-linecap="round" stroke-linejoin="round">
                                   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                   <rect x="6" y="5" width="4" height="14" rx="1"></rect>
                                   <rect x="14" y="5" width="4" height="14" rx="1"></rect>
                                </svg>
                            </a>
                        @else
                            <a wire:click="toggleSyncing({{ $selectedAccount->id }}, true)"
                               class="btn btn-green btn-icon" aria-label="Button">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-player-play"
                                     width="24" height="24"
                                     viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                     stroke-linecap="round"
                                     stroke-linejoin="round">
                                   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                   <path d="M7 4v16l13 -8z"></path>
                                </svg>
                            </a>
                        @endif
                  </span>
                </div>
            </div>
        </div>
    </div>

    <div class="page-body">
        <div class="container-xl">

            @if(session()->has('success'))
                <div class="alert alert-success" role="alert">
                    <div class="text-muted">{{ session()->get('success') }}</div>
                </div>
            @endif

            @if(session()->has('error'))
                <div class="alert alert-danger" role="alert">
                    <div class="text-muted">{{ session()->get('error') }}</div>
                </div>
            @endif

            <div class="row row-deck row-cards">
                <div class="col-md-3 col-lg-3">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Folders</h3>
                        </div>
                        <div class="list-group list-group-flush">
                            @foreach($allFolders as $folder)
                                <a href="#" wire:click="updateSelectedFolder({{ $folder->id }})"
                                   class="list-group-item list-group-item-action @if($folder->id === $selectedFolder->id) active @endif">
                                    {{ $folder->name }}
                                </a>
                            @endforeach
                        </div>
                    </div>
                </div>
                <div class="col-md-9 col-lg-9">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Emails</h3>
                        </div>
                        <div class="table-responsive">
                            <table class="table card-table table-vcenter text-wrap datatable">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Sender Email</th>
                                    <th>Subject</th>
                                    <th>Has Attachment(s)</th>
                                    <th>Imported</th>
                                    <th>Import Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                @foreach($selectedFolderData['emails'] as $email)
                                    <tr>
                                        <td>
                                            <span class="text-muted">
                                                <a href="{{ route('email.view', $email->id) }}"
                                                   target="_blank">{{ $email->id }}</a>
                                            </span>
                                        </td>
                                        <td>{{ $email->getParsedFromAddressAttribute() }}</td>
                                        <td>{{ $email->getParsedSubjectAttribute() }}</td>
                                        <td>{{ $email->has_attachments ? 'Yes' : 'No' }}</td>
                                        <td>
                                            @if($email->imported)
                                                <span class="badge bg-success me-1"></span>
                                            @else
                                                <span class="badge bg-red me-1"></span>
                                            @endif
                                        </td>
                                        <td>{{ $email->created_at->diffForHumans() }}</td>
                                    </tr>
                                @endforeach
                                </tbody>
                            </table>
                        </div>
                        <div class="card-footer d-flex align-items-center">
                            {{ $selectedFolderData['pagination']->onEachSide(1)->links('livewire.pagination.all-accounts-pagination') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
