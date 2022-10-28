<?php

namespace App\Http\Controllers;

use App\Helpers\S3Helper;
use App\Models\Email;
use App\Services\EmailService;
use Auth;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Storage;

class EmailController extends Controller
{
    /**
     * @param int $id
     * @return View
     */
    public function view(int $id)
    {
        $s3Client = Storage::disk('s3')->getClient();

        $email = EmailService::getByEmailIdAndUserId($id, Auth::id());
        $email = current(S3Helper::bulkGet($s3Client, [$email], true));

        switch ($email->getContentTypeAttribute()) {
            case Email::TYPE_TEXT:
                $cleanEmail = nl2br($email->getMessageBody());
                break;
            default:
//                $config = HTMLPurifier_Config::createDefault();
//                $purifier = new HTMLPurifier($config);
//                $cleanEmail = $purifier->purify($email->getParsedBodyAttribute());
                $cleanEmail = $email->getMessageBody();
        }

        return view('email.view', [
            'email' => $cleanEmail
        ]);
    }
}
