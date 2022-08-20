<script lang=ts>
    import Fa from 'svelte-fa'
    import { faAngleDown } from "@fortawesome/free-solid-svg-icons"

    import click_outside from 'src/ts/utils/click_outside'

    export let list: string[]
    export let value: string = list[0]
    let index = 0
    
    let open = false
</script>

<div class="dropdown" on:click={() => open = !open} use:click_outside on:outclick={() => {open = false}}>
    <div class="selected"><span>{value}</span><Fa icon={faAngleDown}/></div>
    {#if open}
        <div class="options" style="top: calc({-index * 100}% - .5rem)">
        {#each list as option, i}
            <div class="option" class:current={option === value} on:click={() => {value = option; index = i}}>{option}</div>
        {/each}
        </div>
    {/if}
</div>

<style lang=scss>
    @use 'src/styles/common';

    .dropdown {
        position: relative;
        cursor: pointer;
    }

    .dropdown:hover {
        background-color: common.$bg-color;
        border-radius: common.$border-radius-sm;
    }
    
    .selected {
        align-items: center;
        justify-content: center;
        border-radius: common.$border-radius-sm;

        span {
            margin-right: .5rem;
        }
    }

    .selected, .option {
        display: flex;
        justify-content: space-between;
        padding: .25rem .5rem;
    }

    .options {
        display: var(--display);
        position: absolute;
        width: 100%;
        padding-block: .5rem;
        background-color: common.$secondary-color;
        color: white;
        
        border-radius: common.$border-radius-sm;
        box-shadow: common.$shadow;
    }

    .option:hover {
        background-color: common.$bg-color;
        color: black;
    }

    .current::after {
        content: '\2022';
    }
</style>