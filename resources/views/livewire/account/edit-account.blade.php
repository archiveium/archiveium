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
                        Edit Account
                    </h2>
                </div>

                <div class="col-12 btn-list col-md-auto ms-auto d-print-none">
                    <span class="d-none d-sm-inline">
                        <a wire:click="deleteAccount()" class="btn btn-red btn-icon"
                           aria-label="Button">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash"
                                 width="24" height="24"
                                 viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                 stroke-linecap="round"
                                 stroke-linejoin="round">
                               <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                               <line x1="4" y1="7" x2="20" y2="7"></line>
                               <line x1="10" y1="11" x2="10" y2="17"></line>
                               <line x1="14" y1="11" x2="14" y2="17"></line>
                               <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                               <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                            </svg>
                        </a>
                  </span>
                </div>

            </div>
        </div>
    </div>

    <div class="page-body">
        <div class="container-xl">

            @error('error')
            <div class="alert alert-danger" role="alert">
                {{ $message }}
            </div>
            @enderror

            <div class="row row-cards">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Account Details</h3>
                        </div>
                        <div class="card-body">
                            <form wire:submit.prevent="updateEmailProvider">
                                <div class="form-group mb-3 ">
                                    <label class="form-label">Name</label>
                                    <input type="text" wire:model.defer="name" class="form-control @error('name') is-invalid @enderror" placeholder="Enter a name for this account">
                                    @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                </div>
                                <div class="form-group mb-3 ">
                                    <label class="form-label">Email address</label>
                                    <input type="text" class="form-control" value="{{ $email }}" disabled>
                                </div>
                                <div class="form-group mb-3 ">
                                    <label class="form-label">Password</label>
                                    <input type="password" wire:model.defer="password" class="form-control @error('password') is-invalid @enderror" placeholder="Enter application password (not the password used for logging in)">
                                    @error('password') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                </div>
                                <div class="form-group mb-3 ">
                                    <label class="form-label">Selected Provider</label>
                                    <div class="form-selectgroup">
                                        <label class="form-selectgroup-item">
                                            <input type="radio" name="provider" class="form-selectgroup-input" checked>
                                            <span class="form-selectgroup-label">{{ $providerName }}</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="form-footer">
                                    <button type="submit" class="btn btn-primary">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

