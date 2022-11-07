<template>
    <div>
        <table v-if="timer.histogram_calced > timer.file_to_load">
            <tr>
                <td class="title">File load:</td>
                <td>{{ Math.round(timer.file_loaded - timer.file_to_load) }}ms</td>
            </tr>
            <tr>
                <td class="title">Raw decode:</td>
                <td>{{ Math.round(timer.raw_decoded - timer.file_loaded) }}ms</td>
            </tr>
            <tr>
                <td class="title">Render:</td>
                <td>{{ Math.round(timer.rendered - timer.raw_decoded) }}ms</td>
            </tr>
            <tr>
                <td class="title">Pixels read:</td>
                <td>{{ Math.round(timer.pixels_read - timer.rendered) }}ms</td>
            </tr>
            <tr>
                <td class="title">Histogram calc:</td>
                <td>{{ Math.round(timer.histogram_calced - timer.pixels_read) }}ms</td>
            </tr>
        </table>
    </div>
</template>

<script>
export default {
    props: ['timer']
}
</script>

<style scoped>
* {
    font-size: 0.8rem;
    color: #777;
}
.title {
    min-width: 150px;
}
</style>
