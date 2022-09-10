@if ($paginator->hasPages())
    @php(isset($this->numberOfPaginatorsRendered[$paginator->getPageName()]) ? $this->numberOfPaginatorsRendered[$paginator->getPageName()]++ : $this->numberOfPaginatorsRendered[$paginator->getPageName()] = 1)

    <p class="m-0 text-muted">
        <span>{!! __('Showing') !!}</span>
        <span>{{ $paginator->firstItem() }}</span>
        <span>{!! __('to') !!}</span>
        <span>{{ $paginator->lastItem() }}</span>
        <span>{!! __('of') !!}</span>
        <span>{{ $paginator->total() }}</span>
        <span>{!! __('results') !!}</span>
    </p>

    <ul class="pagination m-0 ms-auto">
        <li class="page-item @if($paginator->onFirstPage()) disabled @endif">
            <a wire:click="previousPage('{{ $paginator->getPageName() }}')" wire:loading.attr="disabled"
               class="page-link" href="#" tabindex="-1" aria-disabled="true">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24"
                     viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <polyline points="15 6 9 12 15 18"></polyline>
                </svg>
                Previous
            </a>
        </li>
        @foreach ($elements as $element)
            @if (is_string($element))
                <li class="page-item disabled">
                    <a class="page-link" href="#">{{ $element }}</a>
                </li>
            @endif

            @if (is_array($element))
            @foreach ($element as $page => $url)
                <li class="page-item @if ($page == $paginator->currentPage()) active @endif">
                    <a wire:click="gotoPage({{ $page }}, '{{ $paginator->getPageName() }}')" class="page-link" href="#">{{ $page }}</a>
                </li>
            @endforeach
            @endif
        @endforeach
        <li class="page-item @if(!$paginator->hasMorePages()) disabled @endif">
            <a wire:click="nextPage('{{ $paginator->getPageName() }}')" wire:loading.attr="disabled"
               class="page-link" href="#">
                Next
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24"
                     viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <polyline points="9 6 15 12 9 18"></polyline>
                </svg>
            </a>
        </li>
    </ul>
@endif
