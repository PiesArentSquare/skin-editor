<script lang=ts>
    import skin_, { skin_section } from 'src/ts/utils/skin';

    export let skin: skin_
    export let current_section: skin_section;
    export let current_section_name: string
</script>


<div class="container">
    <div class="current">{current_section_name}</div>
</div>
