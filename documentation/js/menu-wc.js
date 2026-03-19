'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">univesal-timing documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CalendarComponent.html" data-type="entity-link" >CalendarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CalendarDetailComponent.html" data-type="entity-link" >CalendarDetailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CircuitMapComponent.html" data-type="entity-link" >CircuitMapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmModalComponent.html" data-type="entity-link" >ConfirmModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DriverRadiosComponent.html" data-type="entity-link" >DriverRadiosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DriverSectorsComponent.html" data-type="entity-link" >DriverSectorsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DriverSelectorComponent.html" data-type="entity-link" >DriverSelectorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FeedbackModalComponent.html" data-type="entity-link" >FeedbackModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MotoGPTimingComponent.html" data-type="entity-link" >MotoGPTimingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NavbarComponent.html" data-type="entity-link" >NavbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileSetupComponent.html" data-type="entity-link" >ProfileSetupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileViewComponent.html" data-type="entity-link" >ProfileViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterComponent.html" data-type="entity-link" >RegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimingTableComponent.html" data-type="entity-link" >TimingTableComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/ImageFallbackDirective.html" data-type="entity-link" >ImageFallbackDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CustomTranslateHttpLoader.html" data-type="entity-link" >CustomTranslateHttpLoader</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CloudinaryService.html" data-type="entity-link" >CloudinaryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/F1CalendarService.html" data-type="entity-link" >F1CalendarService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/F1LiveTimingStreamService.html" data-type="entity-link" >F1LiveTimingStreamService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LanguageService.html" data-type="entity-link" >LanguageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MotoGPService.html" data-type="entity-link" >MotoGPService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProfileService.html" data-type="entity-link" >ProfileService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SecretCodeService.html" data-type="entity-link" >SecretCodeService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuthResponse.html" data-type="entity-link" >AuthResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartData.html" data-type="entity-link" >ChartData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Circuit.html" data-type="entity-link" >Circuit</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfirmationData.html" data-type="entity-link" >ConfirmationData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Driver.html" data-type="entity-link" >Driver</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverInfo.html" data-type="entity-link" >DriverInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverPosition.html" data-type="entity-link" >DriverPosition</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverRadio.html" data-type="entity-link" >DriverRadio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverTable.html" data-type="entity-link" >DriverTable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverTiming.html" data-type="entity-link" >DriverTiming</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErgastResponse.html" data-type="entity-link" >ErgastResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/F1IndexResponse.html" data-type="entity-link" >F1IndexResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/F1Meeting.html" data-type="entity-link" >F1Meeting</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/F1SeasonResponse.html" data-type="entity-link" >F1SeasonResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/F1Session.html" data-type="entity-link" >F1Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/F1SessionFeed.html" data-type="entity-link" >F1SessionFeed</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/F1SessionIndex.html" data-type="entity-link" >F1SessionIndex</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/F1Year.html" data-type="entity-link" >F1Year</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FeedbackData.html" data-type="entity-link" >FeedbackData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LiveTimingState.html" data-type="entity-link" >LiveTimingState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Location.html" data-type="entity-link" >Location</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginInput.html" data-type="entity-link" >LoginInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPCategory.html" data-type="entity-link" >MotoGPCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPClassificationEntry.html" data-type="entity-link" >MotoGPClassificationEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPClassificationResponse.html" data-type="entity-link" >MotoGPClassificationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPEvent.html" data-type="entity-link" >MotoGPEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPLiveRider.html" data-type="entity-link" >MotoGPLiveRider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPLiveTiming.html" data-type="entity-link" >MotoGPLiveTiming</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPSeason.html" data-type="entity-link" >MotoGPSeason</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPSession.html" data-type="entity-link" >MotoGPSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPStandingEntry.html" data-type="entity-link" >MotoGPStandingEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MotoGPStandingsResponse.html" data-type="entity-link" >MotoGPStandingsResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MRData.html" data-type="entity-link" >MRData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Profile.html" data-type="entity-link" >Profile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProfileInput.html" data-type="entity-link" >ProfileInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Race.html" data-type="entity-link" >Race</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RaceTable.html" data-type="entity-link" >RaceTable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterInput.html" data-type="entity-link" >RegisterInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Sector.html" data-type="entity-link" >Sector</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SectorData.html" data-type="entity-link" >SectorData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Segment.html" data-type="entity-link" >Segment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SessionGridData.html" data-type="entity-link" >SessionGridData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TeamRadioCapture.html" data-type="entity-link" >TeamRadioCapture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TeamRadioState.html" data-type="entity-link" >TeamRadioState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TyreStint.html" data-type="entity-link" >TyreStint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/CountryFlagPipe.html" data-type="entity-link" >CountryFlagPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/TyreClassPipe.html" data-type="entity-link" >TyreClassPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/TyreLetterPipe.html" data-type="entity-link" >TyreLetterPipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});