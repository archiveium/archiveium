<?php

namespace App\Http\Controllers;

use App\Models\Email;
use App\Services\EmailService;
use Auth;
use Illuminate\Contracts\View\View;

class EmailController extends Controller
{
    /**
     * @param int $id
     * @return View
     */
    public function view(int $id)
    {
        $email = EmailService::getByEmailIdAndUserId($id, Auth::id());

        switch ($email->getParsedBodyTypeAttribute()) {
            case Email::TYPE_TEXT:
                $cleanEmail = nl2br($email->getParsedBodyAttribute());
                break;
            default:
//                $config = HTMLPurifier_Config::createDefault();
//                $purifier = new HTMLPurifier($config);
//                $cleanEmail = $purifier->purify($email->getParsedBodyAttribute());
                $cleanEmail = $email->getParsedBodyAttribute();
        }

        return view('email.view', [
            'email' => $cleanEmail
        ]);
    }
}
