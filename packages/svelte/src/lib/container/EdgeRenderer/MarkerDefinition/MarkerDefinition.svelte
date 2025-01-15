<script lang="ts">
  import { useStore } from '$lib/store';
  import { Marker } from '$lib/container/EdgeRenderer/MarkerDefinition';

  const store = useStore();
</script>

<defs>
  {#each store.markers as marker (marker.id)}
    <Marker {...marker} />
  {/each}
</defs>
