<script lang=ts>
    import OpenDialog from './OpenDialog.svelte'

    import { onMount } from 'svelte'
    import skin_ from 'src/ts/utils/skin'

    export let skin: skin_
    let savelink: HTMLAnchorElement
    onMount(() => {
        savelink.setAttribute("href", skin.get_image_url())
        skin.subscribe(() => savelink.setAttribute("href", skin.get_image_url()))
    })

    let dialog_open = false
    let slim: boolean
    let file_input: HTMLInputElement
    let files: FileList
    $: if (files && files[0]) {
        dialog_open = true;
    }
    
    function ondone() {
        dialog_open = false
        if (files && files[0]) {
            skin.load(slim, files[0])
            file_input.value = ''
        } else {
            skin.load(slim)
        }
    }
</script>
    
<nav>
    <div class="inner">
        <input type="checkbox" id="hamburger-toggle"/>
        <label class="hamburger-label" for="hamburger-toggle">
            <div class="hamburger"></div>
        </label>
        <ul>
            <li id="new" on:click={() => dialog_open = true}>new</li>
            <li id="open">
                <input id="open-button" type="file" bind:files={files} bind:this={file_input} />
                <label for="open-button">open</label>
            </li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <li id="save"><a bind:this={savelink} download>save</a></li>
        </ul>
        <h1>untitled*</h1>
    </div>
</nav>

<OpenDialog open={dialog_open} bind:slim on:submit={ondone}/>

<style lang="scss">
    @use 'src/styles/common';

    nav {
        background-color: white;
        padding: 0.5rem 2rem;
        box-shadow: common.$shadow;
        z-index: 1;
    }
    
    .inner {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    }

    .hamburger-label {
        display: flex;
        height: 100%;
    }

    li, label {
        cursor: pointer;
    }

    input {
        display: none;
    }

    a {
        all: unset;
    }

    .hamburger,
    .hamburger::before,
    .hamburger::after {
        align-self: center;
        content: '';
        position: absolute;
        display: block;
        width: 25px;
        height: 2px;
        border-radius: 2px;
        background-color: common.$secondary-color;
    }

    .hamburger::before {
        margin-top: -8px;
        width: 20px;
    }

    .hamburger::after {
        margin-top: 8px;
        width: 15px;
    }

    ul {
        display: none;
        position: absolute;
        flex-direction: column;
        top: calc(100% + .5rem);
        left: -2rem;
        width: 100%;
        padding: .5rem 2rem;
        background-color: white;
    }
    
    #hamburger-toggle:checked ~ ul {
        display: flex;
    }

    #hamburger-toggle:checked ~ label .hamburger::before {
        margin-top: 0;
        transform: rotate(45deg);
        width: 25px;
    }

    #hamburger-toggle:checked ~ label .hamburger::after {
        margin-top: 0;
        transform: rotate(-45deg);
        width: 25px;
    }

    #hamburger-toggle:checked ~ label .hamburger {
        background-color: rgba(0,0,0,0);
    }

    li {
        margin-block: 0.5rem;
    }

    h1 {
        justify-self: center;
        font-size: 1rem;
        font-weight: 400;
    }

    @media (min-width: 800px) {
        .hamburger-label, .hamburger {
            display: none;
        }

        .inner {
            justify-content: start;
        }

        ul {
            display: flex;
            position: static;
            flex-direction: row;
            padding: 0;
        }

        li {
            margin-block: 0;
            margin-right: 2rem;
        }
    }
</style>