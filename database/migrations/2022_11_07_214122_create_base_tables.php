<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateBaseTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('username');
            $table->string('password');
            $table->integer('user_id');
            $table->integer('provider_id');
            $table->boolean('syncing')->default(true);
            $table->boolean('deleted')->default(false);
            $table->boolean('searchable')->default(false);
            $table->timestamps();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->text('payload');
            $table->text('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->text('failed_job_ids');
            $table->text('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('queue')->index();
            $table->text('payload');
            $table->smallInteger('attempts');
            $table->integer('reserved_at')->nullable();
            $table->integer('available_at');
            $table->integer('created_at');
        });

        Schema::create('password_resets', function (Blueprint $table) {
            $table->string('email')->index();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('user_invitations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('username');
            $table->boolean('accepted')->default(false);
            $table->timestamp('notification_sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('providers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->boolean('default');
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('folders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('user_id');
            $table->integer('account_id');
            $table->string('name');
            $table->integer('status_uidvalidity');
            $table->integer('status_messages');
            $table->timestampTz('fetch_date_start')->nullable();
            $table->timestampTz('fetch_date_end')->nullable();
            $table->string('fetch_date_end_raw')->nullable();
            $table->integer('last_updated_msgno')->nullable();
            $table->boolean('deleted')->default(false);
            $table->boolean('deleted_remote')->default(false);
            $table->timestamps();
        });

        Schema::create('emails', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('user_id');
            $table->integer('folder_id');
            $table->integer('message_number');
            $table->integer('udate');
            $table->boolean('has_attachments');
            $table->boolean('imported');
            $table->text('import_fail_reason')->nullable();
            $table->timestamps();
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->foreign(['provider_id'])->references(['id'])->on('providers');
            $table->foreign(['user_id'])->references(['id'])->on('users');
        });

        Schema::table('folders', function (Blueprint $table) {
            $table->foreign(['account_id'])->references(['id'])->on('accounts')->onDelete('CASCADE');
            $table->foreign(['user_id'])->references(['id'])->on('users');
        });

        Schema::table('emails', function (Blueprint $table) {
            $table->foreign(['folder_id'])->references(['id'])->on('folders')->onDelete('CASCADE');
            $table->foreign(['user_id'])->references(['id'])->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('emails', function (Blueprint $table) {
            $table->dropForeign('emails_folder_id_foreign');
            $table->dropForeign('emails_user_id_foreign');
        });

        Schema::table('folders', function (Blueprint $table) {
            $table->dropForeign('folders_account_id_foreign');
            $table->dropForeign('folders_user_id_foreign');
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign('accounts_provider_id_foreign');
            $table->dropForeign('accounts_user_id_foreign');
        });

        Schema::dropIfExists('emails');

        Schema::dropIfExists('folders');

        Schema::dropIfExists('users');

        Schema::dropIfExists('providers');

        Schema::dropIfExists('user_invitations');

        Schema::dropIfExists('personal_access_tokens');

        Schema::dropIfExists('password_resets');

        Schema::dropIfExists('jobs');

        Schema::dropIfExists('job_batches');

        Schema::dropIfExists('failed_jobs');

        Schema::dropIfExists('accounts');
    }
}
