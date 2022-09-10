<?php

namespace App\Http\Livewire\Auth;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class Logout extends Component
{
    public $view;

    public function mount($view = null)
    {
        $this->view = $view;
    }

    public function render(): View
    {
        return view('livewire.auth.logout');
    }

    /**
     * @return void
     */
    public function logout(): void
    {
        Auth::logout();

        session()->invalidate();
        session()->regenerateToken();

        $this->redirect(route('login'));
    }
}
