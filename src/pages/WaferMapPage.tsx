// Declare the module type in a type declaration file (e.g., `src/types/uia-wafermap.d.ts`):
// Create a new file `uia-wafermap.d.ts` in the `src/types` folder and add the following:

// src/types/uia-wafermap.d.ts

// const mapProps = {
//   mapId: '1',
//   componentWidth: 1920,
//   componentHeight: 1080,
// }

function WaferMapPage() {
  // const Wafer = uia
  //   .shotmap('wafer2') // element id
  //   .size(600, 10) // size of canvas
  //   .notch('down') // notch direction
  //   .wheel(true) // use the wheel to control zoom in & out
  //   .drag(true) // drag and drop the map
  //   .diePalette(function (value: unknown) {
  //     // color palette, the value passed from result function.
  //     switch (value) {
  //       case 0: // pass
  //         return 0x00ff00 // green
  //       case 1: // fail
  //         return 0xff0000 // red
  //       case 2: // good to bad
  //         return 0xff0000 // red
  //       default: // unknown
  //         return 0xffffff // white
  //     }
  //   })
  // return <Wafer />
  return <div>Wafer Map</div>
}

export default WaferMapPage
