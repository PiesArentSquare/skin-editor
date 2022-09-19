<script lang=ts>
    import Fa from 'svelte-fa'
    import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

    import skin_, { skin_section } from 'src/ts/utils/skin'
    import click_outside from 'src/ts/utils/click_outside'
    import { current_section } from 'src/ts/stores'

    export let skin: skin_

    let current_limb = skin.head
    let current_limb_name = 'head'

    let current_layer = current_limb.inner
    let current_layer_name = 'inner'

    let current_section_name = 'front'

    $: {
        current_layer = current_limb.inner
        current_layer_name = 'inner'

        $current_section = current_layer.front
        current_section_name = 'front'
    }

    let outer: any
    $: {
        if (outer) {
            current_layer = current_limb.outer
            current_layer_name = 'outer'
        } else {
            current_layer = current_limb.inner
            current_layer_name = 'inner'
        }

        // rebind the section to the one that corresponds with the current section name
        $current_section = current_layer[current_section_name]
    }

    let open = false
</script>


<div class="dropdown" use:click_outside on:outclick={() => open = false}>
    <div class="current" on:click={() => open = !open}><span>{current_limb_name + ' ' + current_layer_name + ' ' + current_section_name}</span><Fa icon={faAngleDown}/></div>
    {#if open}
        <div class="container">
            <div class="limbs">
            {#each Object.entries(skin.limbs()) as [name, limb]}
                <span 
                    on:click={() => {
                        current_limb = limb
                        current_limb_name = name
                    }}
                    class:selected={current_limb == limb}
                >
                    {name}
                </span>
            {/each}
            </div>
            <div class="sections" style="--h: {current_limb.inner.front.height / current_limb.inner.top.height}fr; --w: {current_limb.inner.front.width / current_limb.inner.right.width}fr;">
            {#each Object.entries(current_layer) as [name, section]}
                <div
                    class="wrapper"
                    class:selected={$current_section == section}
                    on:click={() => {
                        $current_section = section
                        current_section_name = name
                        open = false
                    }}
                >
                    <img src={section.get_subsection_url()} alt={name} style="background-size: calc(1/{section.width}*200%);">
                </div>
            {/each}
                <div class="layer-select">
                    <label for="outer">outer layer</label>
                    <input type="checkbox" id="outer" bind:checked={outer}>
                </div>
            </div>
        </div>
    {/if}
</div>

<style lang=scss>
    @use 'src/styles/common';

    .dropdown {
        position: relative;
        cursor: pointer;
        margin: 0 .5rem .5rem;
    }

    .current {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: common.$border-radius-sm;
        margin-block: 1rem;

        span {
            margin-right: .5rem;
        }
    }

    .container {
        cursor: default;
        gap: .5rem;
        position: absolute;
        padding: 1rem;
        width: calc(100% - 2rem);
        background-color: white;
        border-radius: common.$border-radius;
        box-shadow: common.$shadow;
    }

    .limbs {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 1rem;
        flex-grow: 1;
        
        span {
            display: flex;
            justify-content: center;
            border: 2px solid transparent;
            padding: .25rem;
            cursor: pointer;
        }
        
        .selected {
            @include common.double-border-sm
        }
    }

    .sections {
        display: grid;
        grid-template-columns: 1fr var(--w) 1fr var(--w);
        grid-template-rows: 1fr var(--h) 1fr;
        gap: 1rem;
        flex-grow: 1;
        margin: auto;
        max-width: 400px;

        .wrapper {
            display: flex;
            position: relative;
            border-radius: common.$border-radius-sm;
            cursor: pointer;
            box-shadow: common.$shadow;
        }

        img {
            border-radius: common.$border-radius-sm;
            width: 100%;
            @include common.transparent
        }

        .selected::after {
            content: '';
            position: absolute;
            inset: -3px;
            @include common.double-border-shadow
        }

        .layer-select {
            grid-column: 3 / 5;
            grid-row: 3;
            justify-self: end;
            align-self: end;

            display: flex;
            align-items: center;

            label {
                margin-right: .5rem;
            }
        }

        :nth-child(1) {
            grid-column: 2;
            grid-row: 1;
        }

        :nth-child(2) {
            grid-column: 1;
            grid-row: 2;
        }

        :nth-child(3) {
            grid-column: 2;
            grid-row: 2;
        }
        
        :nth-child(4) {
            grid-column: 3;
            grid-row: 2;
        }
        
        :nth-child(5) {
            grid-column: 4;
            grid-row: 2;
        }
        
        :nth-child(6) {
            grid-column: 2;
            grid-row: 3;
        }
    }

    @media (max-width: 900px) {
        .container {
            display: flex;
        }

        .limbs {
            flex-direction: column;
            margin-bottom: 0;
        }
    }

</style>
