*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            https://www.csse3269.cpkku.com/login
${USERNAME}       Kren_123
${PASSWORD}       abcd1234

*** Test Cases ***
Verify User Receives Status Update Notification
    Login As User
    Open Notification Panel
    Verify Status Update Notification

*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    notify_login_open.png


Login As User
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    notify_login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    notify_login_filled.png

    Click Element    xpath=//button[@type="submit"]
    Wait Until Location Contains    csse3269    15s
    Capture Page Screenshot    notify_home_loaded.png


Open Notification Panel
    Wait Until Element Is Visible
    ...    xpath=//button//*[name()='svg']
    ...    15s

    Capture Page Screenshot    notify_before_click_bell.png

    Click Element    xpath=//button//*[name()='svg']

    Wait Until Keyword Succeeds    20s    2s
    ...    Page Should Contain    อัปเดตสถานะรายงาน

    Capture Page Screenshot    notify_dropdown_open.png


Verify Status Update Notification
    Page Should Contain    อัปเดตสถานะรายงาน
    Capture Page Screenshot    notify_title_verified.png

