const map = L.map('map').setView([39.82, -98.58], 4);

    const avionIcon = L.icon({
      iconUrl: 'plane.png',
      iconSize: [32, 32] // Ajustez la taille selon vos besoins
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Récupérer les données des aéroports depuis le serveur PHP
    fetch('affichage.php')
      .then(response => response.json())
      .then(data => {
      // Traiter les données et les ajouter à la carte
      data.forEach(aeroport => {
        let marker = L.marker([aeroport.Latitude, aeroport.Longitude],{ icon: avionIcon })
          .addTo(map)
          .bindPopup(`
          <strong>Nom de l'aéroport:</strong> ${aeroport.AIRPORT}<br>
          <strong>IATA:</strong> ${aeroport.IATA_CODE}<br>
          <strong>Latitude:</strong> ${aeroport.Latitude}<br>
          <strong>Longitude:</strong> ${aeroport.Longitude}
        `);
        marker.on('click', function() {
          marker.openPopup();
        });
        });
      });