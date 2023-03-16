import type { LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import DashboardFallback from "~/components/fallbacks/dashboard";
import Navbar from "~/components/navbar";
import { buildDashboardData } from "~/controllers/dashboard.server";
import { requireUserId } from "~/utils/session";

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request);
    const dashboardData = buildDashboardData(userId);
    return defer({ dashboardData });
}

export default function Index() {
    const data = useLoaderData<typeof loader>();

    return (
        <div>
            <Navbar/>
            <div className="container-xl">
                <div className="page-header d-print-none">
                    <div className="row g-2 align-items-center">
                        <div className="col">
                            <div className="page-pretitle">
                                Overview
                            </div>
                            <h2 className="page-title">
                                Backups
                            </h2>
                        </div>
                        <div className="col-12 col-md-auto ms-auto d-print-none">
                            <div className="btn-list">
                                <a href="{{ route('add-account') }}" className="btn btn-primary d-sm-inline-block">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24"
                                        viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                        strokeLinecap="round" strokeLinejoin="round">
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

            <div className="page-body">
                <div className="container-xl">

                    {/* <div wire:ignore>
                @if(session()->has('success'))
                    <div className="alert alert-success" role="alert">
                        <div className="text-muted">{{ session()->get('success') }}</div>
                    </div>
                @endif
                </div> */}

                    <Suspense fallback={ <DashboardFallback/> }>
                        <Await resolve={data.dashboardData} errorElement={ <p>Error loading data!</p> }>
                        {(dashboardData) => (
                            <div className="card">
                                <div className="card-body">
                                    <div className="datagrid">
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">Accounts Added</div>
                                            <div className="datagrid-content">
                                                {/* @if($accountAddedCount > 0)
                                                <a href="{{ route('all-accounts') }}">
                                                    {{ $accountAddedCount }}
                                                </a>
                                            @else
                                                {{ $accountAddedCount }}
                                            @endif */}
                                            </div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">Accounts Syncing</div>
                                            <div className="datagrid-content">
                                                {/* {{ $accountSyncingCount }} */}
                                            </div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">Emails Processed</div>
                                            {/* <div className="datagrid-content">{{ $emailCounts['processed'] }}</div> */}
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">Emails Archived</div>
                                            {/* <div className="datagrid-content">{{ $emailCounts['successful'] }}</div> */}
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">Failures</div>
                                            {/* <div className="datagrid-content">{{ $emailCounts['failed'] }}</div> */}
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="d-flex mb-2">
                                                {/* <div className="datagrid-title">Quota Usage ({{ $quota }} emails)</div> */}
                                                {/* <div className="ms-auto">
                                                <span className="d-inline-flex align-items-center lh-1">
                                                {{ $quotaUsed }} %
                                                </span>
                                            </div> */}
                                            </div>
                                            <div className="datagrid-content">
                                                <div className="progress progress-sm">
                                                    {/* <div className="progress-bar" style="width: {{ $quotaUsed }}%" role="progressbar" aria-valuenow="{{ $quotaUsed }}" aria-valuemin="0" aria-valuemax="100" aria-label="{{ $quotaUsed }}% Used">
                                                    <span className="visually-hidden">{{ $quotaUsed }}% Used</span>
                                                </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        </Await>
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
