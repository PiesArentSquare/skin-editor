<script lang=ts>
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    export let open = false
    export let slim = false
    $: if (open) slim = false
</script>

<div class="bg" class:open={open}>
    <div class="dialog">
        <p>player model:</p>
        <div class="radios">
            <label>
                <input type="radio" bind:group={slim} name="slim" value={false}>
                classic
            </label>
            <label>
                <input type="radio" bind:group={slim} name="slim" value={true}>
                slim
            </label>
        </div>
        <div class="button" on:click={() => dispatch('submit')}>open</div>
    </div>
</div>

<style lang=scss>
    @use 'src/styles/common';

    .bg {
        display: none;
    }

    .bg.open {
        display: flex;
        position: absolute;
        z-index: 99;
        inset: 0;
        align-items: center;
        justify-content: center;
        background: #00000030;
    }

    .dialog {
        width: 200px;
        max-width: 100%;
        padding: .5rem;
        background: white;
        @include common.double-border;
    }

    p {
        margin-bottom: .5rem;
    }

    .radios {
        display: flex;
        justify-content: space-between;
        margin-bottom: .5rem;

        label {
            width: 50%;
        }
    }

    .button {
        width: calc(100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding-block: .5rem; 
        background: common.$secondary-color;
        border-radius: common.$border-radius;
        color: white;
        cursor: pointer;
    }
</style>