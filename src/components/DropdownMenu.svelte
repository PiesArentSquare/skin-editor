<script lang=ts>
    import Fa from 'svelte-fa'
    import { faAngleDown } from "@fortawesome/free-solid-svg-icons"

    import click_outside from 'src/ts/utils/click_outside'

    export let list: string[]
    export let value: string
    
    let open = false
</script>

<div class="dropdown" on:click={() => open = !open} use:click_outside on:outclick={() => {open = false}}>
    <div class="selected"><span>{value}</span><Fa icon={faAngleDown}/></div>
    {#if open}
        <div class="options">
        {#each list as option}
            <div class="option" on:click={() => value = option}>{option}</div>
        {/each}
        </div>
    {/if}
</div>

<style lang=scss>
    @use 'src/styles/common';

    .dropdown {
        position: relative;
        margin-right: .5rem;
        cursor: pointer;
    }

    .dropdown:hover {
        background-color: common.$bg-color;
        border-radius: common.$border-radius-sm;
    }
    
    .selected {
        display: flex;
        align-items: center;
        border-radius: common.$border-radius-sm;

        span {
            margin-right: .5rem;
        }
    }

    .selected, .option {
        padding: .25rem .5rem;
    }

    .options {
        display: var(--display);
        position: absolute;
        top: -.5rem;
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
</style>