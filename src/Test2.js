import * as React from 'react';
import { View, Image } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Supercluster from 'supercluster';
import Axios from "axios";

import places from './test.json';

import museum from './map_musee.png'
import uncategorized from './map_uncategorized.png';


MapboxGL.setAccessToken("pk.eyJ1IjoiYWxleGFuZHJldGhvcmlnbnkiLCJhIjoiY2swNWZ0MGZpMGdyeDNucGNnM3R6aWZyaSJ9.ZeX04_yvxDbk6NTqSbuk3w");

const styles = {
    icon: {
        iconImage: ['get', 'marker'],
        // iconImage: "http://www.caravel-app.ovh/ressources/pictos/marker/map_musee.png",
        iconImage: '{marker}',
        iconAllowOverlap: true,
        iconSize: 0.3,
    },
};

const layerStyles = {
    icoMuseum: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconSize: 0.3,
        iconImage: museum,
    },
    icoUncategorized: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconSize: 0.3,
        iconImage: uncategorized,
    },

    singlePoint: {
        circleColor: 'green',
        circleOpacity: 0.84,
        circleStrokeWidth: 2,
        circleStrokeColor: 'white',
        circleRadius: 5,
      },

      clusteredPoints: {
        // circleColor: [
        //   'interpolate',
        //   ['exponential', 1.5],
        //   ['get', 'point_count'],
        //   25, 'yellow',
        //   50, 'red',
        //   75, 'blue',
        //   100, 'orange',
        //   300, 'pink',
        //   750, 'white',
        // ],

        circleColor: [
  'step',
  ['get', 'point_count'],
  '#51bbd6',
  100,
  '#f1f075',
  750,
  '#f28cb1',
],

        // circleRadius: [
        //   'interpolate',
        //   ['exponential', 1.5],
        //   ['get', 'point_count'],
        //   [0, 15],
        //   [100, 20],
        //   [750, 30],
        // ],

        circleRadius: ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],

        circleOpacity: 0.4,
        circleStrokeWidth: 2,
        circleStrokeColor: 'white',
      },

      clusterCount: {
        textField: ['get', 'point_count'],
        textSize: 12,
      },
    };

// const mapStyles = MapboxGL.StyleSheet.create({
//   icon: {
//     iconAllowOverlap: true,
//     iconSize: 0.35,
//   },
//   clusteredPoints: {
//     circleColor: '#004466',
//     circleRadius: [
//       'interpolate',
//       ['exponential', 1.5],
//       ['get', 'point_count'],
//       15,
//       15,
//       20,
//       30,
//     ],
//     circleOpacity: 0.84,
//   },
//   clusterCount: {
//     textField: '{point_count}',
//     textSize: 12,
//     textColor: '#ffffff',
//   },
// });

class App extends React.Component {
  
  state = {
    markers: places
  };

  renderMarkers = () => {
      if (this.state.markers.length > 0 && this.state.markers !== null) {
          console.log("renderMarkers function - markers state", this.state.markers);
          return this.state.markers.map( (item) => (
              <MapboxGL.PointAnnotation
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  coordinate={[item.lng, item.lat]}
              >
                  <Image
                      source={{ uri: item.marker }}
                      style={{ flex: 1, resizeMode: 'contain', width: 50, height: 50 }}
                  />
              </MapboxGL.PointAnnotation>
          ))
      }
  }

  updateClusters = async (values) => {
    console.log('updateClusters function - input values', values);
    const searchRegion = {
      params: {
        ne_lat: values.properties.visibleBounds[0][1],
        ne_lng: values.properties.visibleBounds[0][0],
        sw_lat: values.properties.visibleBounds[1][1],
        sw_lng: values.properties.visibleBounds[1][0],
        lat: 47.383333,
        lng: 0.683333,
      }
	  };

    await Axios({ method: 'post', url: 'https://fr.caravel-app.ovh/api/v1/sites/geo_map', data: searchRegion.params })
      .then( (responseJson) => {
      console.log("updateClusters function - responseJsonMap : ", responseJson.data);
          this.setState({
              markers: responseJson.data,
          });
    })
    .catch( (error) => {
      console.log(error)
      alert("Erreur serveur, veuillez réessayer ultérieurement");
    });
  }


  render() {
    console.log(this.state.markers)
    return (
          <View style={{ flex: 1 }}>
            <MapboxGL.MapView
                ref={c => (this._map = c)}
                zoomEnabled
                style={[{ flex: 1 }]}
                styleURL={'mapbox://styles/mapbox/streets-v9'}
                onRegionDidChange={ (values) => this.updateClusters(values) }
            >
              <MapboxGL.Camera
                  centerCoordinate={[0.683333, 47.383333]}
                  zoomLevel={12}
              />
              <MapboxGL.ShapeSource
                id="earthquakes"
                cluster
                clusterRadius={50}
                clusterMaxZoom={14}
                shape={this.state.markers}
              >
                <MapboxGL.SymbolLayer
                    id='pointCount'
                    style={layerStyles.clusterCount}
                />
                <MapboxGL.CircleLayer
                  id='clusteredPoints'
                  belowLayerID='pointCount'
                  filter={['has', 'point_count']}
                  style={layerStyles.clusteredPoints}
                />
                <MapboxGL.SymbolLayer id="singlePoint" filter={['!=', 'marker', 'uncategorized']} style={layerStyles.icoMuseum} />
                <MapboxGL.SymbolLayer id="singlePoint" filter={['==', 'marker', 'uncategorized']} style={layerStyles.icoUncategorized} />
              </MapboxGL.ShapeSource>
            </MapboxGL.MapView>
          </View>
        );
      }
}

export default App;
