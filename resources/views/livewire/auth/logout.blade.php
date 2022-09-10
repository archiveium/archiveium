@if($view === "guest")
    <div class="text-center text-muted mt-3">
        <a href="#" wire:click="logout()" tabindex="-1">Logout</a> to use a different account
    </div>
@else
    <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
        <a href="#" wire:click="logout()" class="dropdown-item">Logout</a>
    </div>
@endif
