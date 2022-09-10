<?php

namespace App\Http\Livewire;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

abstract class Base extends Component
{
    /**
     * @var User
     */
    private $user;

    /**
     * @return array
     */
    abstract public function getViewData(): array;

    /**
     * @return string
     */
    abstract public function getLivewireView(): string;

    public function __construct($id = null)
    {
        parent::__construct($id);

        $this->user = Auth::getUser();
    }

    /**
     * @return array
     */
    public function getLayoutData(): array
    {
        $user = $this->getUser();

        return [
            'user'     => $user,
            'loggedIn' => !is_null($user)
        ];
    }

    public function render()
    {
        $livewireView = sprintf("livewire.%s", $this->getLivewireView());

        $view = view($livewireView, $this->getViewData())
            ->layoutData($this->getLayoutData());

        if (!is_null($this->getLayout())) {
            $view->layout($this->getLayout());
        }

        return $view;
    }

    /**
     * @return string|null
     */
    public function getLayout(): ?string
    {
        return null;
    }

    /**
     * @return User|null
     */
    public function getUser(): ?User
    {
        return $this->user;
    }
}
