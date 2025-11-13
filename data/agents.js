let agents = [
  { name: 'Astra', color: '#2e005c', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/astra.mp3', isDefault: true } , 
      { label: 'Option 2', path: 'assets/sounds/astra2.mp3', isDefault: false }
    ] },
  { name: 'Breach', color: '#f08c29', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/breach.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/breach2.mp3', isDefault: false }
    ] },
  { name: 'Brimstone', color: '#9c8340', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/brimstone.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/brimstone2.mp3', isDefault: false }
    ] },
  { name: 'Chamber', color: '#ffff99', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/chamber.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/chamber2.mp3', isDefault: false }
    ] },
  { name: 'Clove', color: '#a06cc4ff', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/clove.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/clove2.mp3', isDefault: false }
    ] },
  { name: 'Cypher', color: '#7f7f7f', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/cypher.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/cypher2.mp3', isDefault: false }
    ] },
  { name: 'Deadlock', color: '#ccffff', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/deadlock.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/deadlock2.mp3', isDefault: false }
    ] },
  { name: 'Fade', color: '#1d1636', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/fade.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/fade2.mp3', isDefault: false }
    ] },
  { name: 'Gekko', color: '#bae655', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/gekko.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/gekko2.mp3', isDefault: false }
    ] },
  { name: 'Harbor', color: '#11545e', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/harbor.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/harbor2.mp3', isDefault: false }
    ] },
  { name: 'Iso', color: '#6c00d6', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/iso.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/iso2.mp3', isDefault: false }
    ] },
  { name: 'Jett', color: '#bbd6f0', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/jett.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/jett2.mp3', isDefault: false }
    ] },
  { name: 'KAY/O', color: '#124da1', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/kayo.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/kayo2.mp3', isDefault: false }
    ] },
  { name: 'Killjoy', color: '#f7cb2d', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/killjoy.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/killjoy2.mp3', isDefault: false }
    ] },
  { name: 'Neon', color: '#1e4194', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/neon.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/neon2.mp3', isDefault: false }
    ] },
  { name: 'Omen', color: '#26195e', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/omen.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/omen2.mp3', isDefault: false }
    ] },
  { name: 'Phoenix', color: '#913d00', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/phoenix.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/phoenix2.mp3', isDefault: false }
    ] },
  { name: 'Raze', color: '#ffb366', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/raze.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/raze2.mp3', isDefault: false }
    ] },
  { name: 'Reyna', color: '#8610b5', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/reyna.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/reyna2.mp3', isDefault: false }
    ] },
  { name: 'Sage', color: '#00a38b', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/sage.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/sage2.mp3', isDefault: false }
    ] },
  { name: 'Skye', color: '#2ea646', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/skye.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/skye2.mp3', isDefault: false }
    ] },
  { name: 'Sova', color: '#7cabcc', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/sova.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/sova2.mp3', isDefault: false }
    ] },
  { name: 'Tejo', color: '#deca6f', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/tejo.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/tejo2.mp3', isDefault: false }
    ] },
  { name: 'Veto', color: '#4b8e9c', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/veto.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/veto2.mp3', isDefault: false }
    ] },
  { name: 'Viper', color: '#27c427', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/viper.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/viper2.mp3', isDefault: false }
    ] },
  { name: 'Vyse', color: '#6949d1', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/vyse.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/vyse2.mp3', isDefault: false }
    ] },
  { name: 'Waylay', color: '#0fd6ae', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/waylay.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/waylay2.mp3', isDefault: false }
    ] },
  { name: 'Yoru', color: '#1a1a91', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/yoru.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/yoru2.mp3', isDefault: false }
    ] }
];