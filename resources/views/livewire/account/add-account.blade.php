<div>
    <div class="container-xl">

        <!-- Page title -->
        <div class="page-header d-print-none">
            <div class="row g-2 align-items-center">
                <div class="col">
                    <div class="page-pretitle">
                        Configure
                    </div>
                    <h2 class="page-title">
                        Add Account
                    </h2>
                </div>
            </div>
        </div>
    </div>

    <div class="page-body">
        <div class="container-xl">

            @if(session()->has('addAccountSuccess'))
                <div class="alert alert-success" role="alert">
                    <div class="text-muted">{{ session()->get('addAccountSuccess') }}</div>
                </div>
            @endif

            @error('addAccountError')
            <div class="alert alert-danger" role="alert">
                {{ $message }}
            </div>
            @enderror

            <div class="row row-cards">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Credentials</h3>
                        </div>
                        <div class="card-body">
                            <form wire:submit.prevent="submitEmailProvider">
                                <fieldset @if(!empty($folderSyncCandidates)) disabled @endif>
                                    <div class="form-group mb-3 ">
                                        <label class="form-label">Name</label>
                                        <input type="text" wire:model.defer="name" class="form-control @error('name') is-invalid @enderror" placeholder="Enter a name for this account">
                                        @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                    </div>
                                    <div class="form-group mb-3 ">
                                        <label class="form-label">Email address</label>
                                        <input type="text" wire:model.defer="email" class="form-control @error('email') is-invalid @enderror" placeholder="Enter the email used for logging in">
                                        @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                    </div>
                                    <div class="form-group mb-3 ">
                                        <label class="form-label">Password</label>
                                        <input type="password" wire:model.defer="password" class="form-control @error('password') is-invalid @enderror" placeholder="Enter application password (not the password used for logging in)">
                                        @error('password') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                    </div>
                                    <div class="form-group mb-3 ">
                                        <label class="form-label">Select Provider</label>
                                        <div class="form-selectgroup">
                                            @foreach($allProviders as $provider)
                                                <label class="form-selectgroup-item">
                                                    <input type="radio" name="provider" wire:model="selectedProvider" value="{{ $provider->id }}" class="form-selectgroup-input">
                                                    <span class="form-selectgroup-label">{{ $provider->name }}</span>
                                                </label>
                                            @endforeach
                                        </div>
                                    </div>
                                    <div class="form-footer">
                                        <button type="submit" class="btn btn-primary">
                                            <div wire:loading.remove wire:target="submitEmailProvider">Fetch Folders</div>
                                            <div wire:loading wire:target="submitEmailProvider">Connecting & Fetching Folders</div>
                                        </button>
                                    </div>
                                </fieldset>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Available Folders</h3>
                        </div>

                        @if(empty($folderSyncCandidates))
                            <div class="empty">
                                <p class="empty-title">No folders found</p>
                                <p class="empty-subtitle text-muted">
                                    Enter valid credentials to see available folders for that account.
                                </p>
                            </div>
                        @else
                            <form wire:submit.prevent="submitFolderSyncCandidates">
                                <div class="table-responsive card-body-scrollable" style="height: 24em;">
                                    <table class="table card-table table-vcenter">
                                        <tbody>
                                            @foreach($folderSyncCandidates as $index => $syncCandidate)
                                            <tr>
                                                <td class="w-1 pe-0">
                                                    <input
                                                        type="checkbox"
                                                        wire:model="selectedSyncCandidates.{{ $index }}"
                                                        value="{{ $syncCandidate['name'] }}"
                                                        class="form-check-input m-0 align-middle"
                                                        aria-label="Select task"
                                                    >
                                                </td>
                                                <td class="w-100">
                                                    <a href="#" class="text-reset">{{ $syncCandidate['name'] }}</a>
                                                </td>
                                                <td class="text-nowrap">
                                                    <a href="#" class="text-muted">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4"></path><line x1="8" y1="9" x2="16" y2="9"></line><line x1="8" y1="13" x2="14" y2="13"></line></svg>
                                                        {{ $syncCandidate['count'] }}
                                                    </a>
                                                </td>
                                            </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                                <div class="card-footer">
                                    <button type="submit" class="btn btn-primary">Save Account</button>
                                </div>
                            </form>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

